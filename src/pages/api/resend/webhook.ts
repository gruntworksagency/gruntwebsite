import type { APIRoute } from "astro";
import { Webhook } from "svix";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Metrics counters for monitoring
let emailMetrics = {
  sent: 0,
  delivered: 0,
  bounced: 0,
  complained: 0,
  opened: 0,
  clicked: 0,
};

/**
 * Logs metrics to console and Sentry (if configured)
 */
function updateMetrics(eventType: string) {
  switch (eventType) {
    case "email.sent":
      emailMetrics.sent++;
      break;
    case "email.delivered":
      emailMetrics.delivered++;
      break;
    case "email.bounced":
      emailMetrics.bounced++;
      break;
    case "email.complained":
      emailMetrics.complained++;
      break;
    case "email.opened":
      emailMetrics.opened++;
      break;
    case "email.clicked":
      emailMetrics.clicked++;
      break;
  }

  // Log current metrics
  console.log("Email metrics updated:", { eventType, metrics: emailMetrics });

  // Check complaint rate (alert if > 0.1%)
  const totalSent = emailMetrics.sent;
  if (totalSent > 100) {
    // Only check after reasonable sample size
    const complaintRate = (emailMetrics.complained / totalSent) * 100;
    if (complaintRate > 0.1) {
      console.error("HIGH COMPLAINT RATE ALERT:", {
        complaintRate: `${complaintRate.toFixed(3)}%`,
        complaints: emailMetrics.complained,
        totalSent,
      });

      // Send to Sentry if configured
      if (typeof globalThis !== "undefined" && (globalThis as any).Sentry) {
        (globalThis as any).Sentry.captureException(
          new Error("High email complaint rate detected"),
          {
            tags: {
              service: "email",
              alert_type: "complaint_rate",
            },
            extra: {
              complaintRate,
              complaints: emailMetrics.complained,
              totalSent,
            },
          },
        );
      }
    }
  }
}

/**
 * Auto-suppresses email addresses that bounce or complain
 */
async function handleSuppression(
  email: string,
  eventType: string,
  eventData: any,
) {
  try {
    if (eventType === "email.bounced") {
      await prisma.bounce.create({
        data: {
          email,
          reason: eventData.reason || "Unknown bounce reason",
          bounceType: eventData.type || "unknown",
          messageId: eventData.messageId,
        },
      });

      // Auto-unsubscribe on hard bounces
      if (eventData.type === "hard") {
        await prisma.unsubscribe.upsert({
          where: {
            email_userId: {
              email,
              userId: null,
            },
          },
          update: {
            reason: `auto-unsubscribe-hard-bounce`,
          },
          create: {
            email,
            userId: null,
            reason: `auto-unsubscribe-hard-bounce`,
          },
        });

        console.log("Auto-unsubscribed due to hard bounce:", {
          email,
          reason: eventData.reason,
        });
      }
    }

    if (eventType === "email.complained") {
      await prisma.complaint.create({
        data: {
          email,
          reason: eventData.reason || "Spam complaint",
          messageId: eventData.messageId,
        },
      });

      // Auto-unsubscribe on complaints
      await prisma.unsubscribe.upsert({
        where: {
          email_userId: {
            email,
            userId: null,
          },
        },
        update: {
          reason: `auto-unsubscribe-complaint`,
        },
        create: {
          email,
          userId: null,
          reason: `auto-unsubscribe-complaint`,
        },
      });

      console.log("Auto-unsubscribed due to complaint:", {
        email,
        reason: eventData.reason,
      });
    }
  } catch (error) {
    console.error("Error handling suppression:", { email, eventType, error });
  }
}

export const POST: APIRoute = async ({ request }) => {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("Missing RESEND_WEBHOOK_SECRET environment variable");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  try {
    // Get the raw body and headers
    const body = await request.text();
    const signature = request.headers.get("svix-signature") || "";
    const timestamp = request.headers.get("svix-timestamp") || "";
    const id = request.headers.get("svix-id") || "";

    // Verify webhook signature using Svix
    const webhook = new Webhook(webhookSecret);
    let event: any;

    try {
      event = webhook.verify(body, {
        "svix-id": id,
        "svix-timestamp": timestamp,
        "svix-signature": signature,
      });
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response("Invalid signature", { status: 401 });
    }

    console.log("Resend Webhook Event:", {
      type: event.type,
      email: event.data?.to?.[0] || event.data?.email,
      messageId: event.data?.messageId,
      timestamp: new Date().toISOString(),
    });

    // Update metrics
    updateMetrics(event.type);

    // Handle suppression for bounces and complaints
    const email = event.data?.to?.[0] || event.data?.email;
    if (
      email &&
      (event.type === "email.bounced" || event.type === "email.complained")
    ) {
      await handleSuppression(email, event.type, event.data);
    }

    // Log successful processing
    console.log("Webhook processed successfully:", {
      eventType: event.type,
      email,
      processed: true,
    });

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);

    // Send error to Sentry if configured
    if (typeof globalThis !== "undefined" && (globalThis as any).Sentry) {
      (globalThis as any).Sentry.captureException(error, {
        tags: {
          service: "email",
          endpoint: "webhook",
        },
      });
    }

    return new Response("Internal server error", { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
};
