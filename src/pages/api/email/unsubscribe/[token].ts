import type { APIRoute } from "astro";
import { validateUnsubscribeToken } from "../../../../lib/email";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const GET: APIRoute = async ({ params, request }) => {
  const { token } = params;

  if (!token) {
    return new Response("Missing token", { status: 400 });
  }

  try {
    // Validate the unsubscribe token
    const payload = validateUnsubscribeToken(token);

    if (!payload) {
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invalid Unsubscribe Link</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
              .container { text-align: center; }
              .error { color: #d32f2f; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1 class="error">Invalid or Expired Unsubscribe Link</h1>
              <p>This unsubscribe link is either invalid or has expired.</p>
              <p>If you continue to receive unwanted emails, please contact support.</p>
            </div>
          </body>
        </html>
      `,
        {
          status: 400,
          headers: { "Content-Type": "text/html" },
        },
      );
    }

    // Record the unsubscribe in the database
    await prisma.unsubscribe.upsert({
      where: {
        email_userId: {
          email: payload.e,
          userId: payload.u || null,
        },
      },
      update: {
        createdAt: new Date(),
        reason: "one-click-unsubscribe",
      },
      create: {
        email: payload.e,
        userId: payload.u || null,
        reason: "one-click-unsubscribe",
      },
    });

    // Log the unsubscribe event
    console.log("Email unsubscribed:", {
      email: payload.e,
      userId: payload.u,
      timestamp: new Date().toISOString(),
      method: "one-click",
    });

    // Return success page
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Unsubscribed Successfully</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .container { text-align: center; }
            .success { color: #2e7d32; }
            .email { background-color: #f5f5f5; padding: 10px; border-radius: 4px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="success">✓ Unsubscribed Successfully</h1>
            <p>The email address <span class="email">${payload.e}</span> has been unsubscribed from our mailing list.</p>
            <p>You will no longer receive marketing emails from us.</p>
            <p><small>Note: You may still receive transactional emails related to your account or orders.</small></p>
          </div>
        </body>
      </html>
    `,
      {
        status: 200,
        headers: { "Content-Type": "text/html" },
      },
    );
  } catch (error) {
    console.error("Unsubscribe error:", error);

    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Unsubscribe Error</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .container { text-align: center; }
            .error { color: #d32f2f; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="error">Unsubscribe Error</h1>
            <p>We encountered an error while processing your unsubscribe request.</p>
            <p>Please contact support if this problem persists.</p>
          </div>
        </body>
      </html>
    `,
      {
        status: 500,
        headers: { "Content-Type": "text/html" },
      },
    );
  } finally {
    await prisma.$disconnect();
  }
};

// Support POST for one-click unsubscribe (RFC 8058)
export const POST: APIRoute = async ({ params, request }) => {
  const { token } = params;

  if (!token) {
    return new Response("Missing token", { status: 400 });
  }

  try {
    // Validate the unsubscribe token
    const payload = validateUnsubscribeToken(token);

    if (!payload) {
      return new Response("Invalid or expired token", { status: 400 });
    }

    // Record the unsubscribe in the database
    await prisma.unsubscribe.upsert({
      where: {
        email_userId: {
          email: payload.e,
          userId: payload.u || null,
        },
      },
      update: {
        createdAt: new Date(),
        reason: "one-click-unsubscribe-post",
      },
      create: {
        email: payload.e,
        userId: payload.u || null,
        reason: "one-click-unsubscribe-post",
      },
    });

    // Log the unsubscribe event
    console.log("Email unsubscribed via POST:", {
      email: payload.e,
      userId: payload.u,
      timestamp: new Date().toISOString(),
      method: "one-click-post",
    });

    return new Response("Unsubscribed successfully", { status: 200 });
  } catch (error) {
    console.error("Unsubscribe POST error:", error);
    return new Response("Internal server error", { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
};
