import { Resend } from "resend";
import nodemailer from "nodemailer";
import jwt from "jwt-simple";
import { render } from "@react-email/render";
import { MagicLinkEmail } from "./templates/MagicLink";

type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
  headers?: Record<string, string>;
  bulk?: boolean;
  unsubscribePath?: boolean;
  userId?: string;
};

type UnsubscribeTokenPayload = {
  e: string; // email
  u?: string; // userId (optional)
  exp: number; // expiration timestamp
};

const RESEND_JWT_SECRET =
  process.env.RESEND_JWT_SECRET || "fallback-secret-change-in-production";
const SITE_URL = process.env.BETTER_AUTH_URL || "http://localhost:4321";
const MAIL_DOMAIN = process.env.MAIL_DOMAIN || "example.com";

/**
 * Generates a JWT token for one-click unsubscribe functionality
 */
export function generateUnsubscribeToken(
  email: string,
  userId?: string,
): string {
  const payload: UnsubscribeTokenPayload = {
    e: email,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days expiration
  };

  if (userId) {
    payload.u = userId;
  }

  return jwt.encode(payload, RESEND_JWT_SECRET);
}

/**
 * Validates and decodes an unsubscribe token
 */
export function validateUnsubscribeToken(
  token: string,
): UnsubscribeTokenPayload | null {
  try {
    const payload = jwt.decode(
      token,
      RESEND_JWT_SECRET,
    ) as UnsubscribeTokenPayload;

    if (payload.exp < Date.now()) {
      console.warn("Unsubscribe token expired:", { token, exp: payload.exp });
      return null;
    }

    return payload;
  } catch (error) {
    console.error("Invalid unsubscribe token:", { error, token });
    return null;
  }
}

/**
 * Logs email sending metrics and breadcrumbs for monitoring
 */
function logEmailMetrics(
  options: SendEmailOptions,
  success: boolean,
  error?: any,
) {
  const logData = {
    timestamp: new Date().toISOString(),
    to: options.to,
    subject: options.subject,
    bulk: options.bulk,
    success,
    environment: process.env.NODE_ENV,
  };

  if (success) {
    console.log("Email sent successfully:", logData);
  } else {
    console.error("Email send failed:", { ...logData, error });
  }

  // Sentry breadcrumb (if Sentry is configured)
  if (typeof globalThis !== "undefined" && (globalThis as any).Sentry) {
    (globalThis as any).Sentry.addBreadcrumb({
      category: "email",
      message: `Email ${success ? "sent" : "failed"} to ${options.to}`,
      level: success ? "info" : "error",
      data: logData,
    });
  }
}

async function sendEmail(options: SendEmailOptions) {
  const {
    to,
    subject,
    html,
    headers = {},
    bulk = false,
    unsubscribePath = false,
    userId,
  } = options;

  // Add unsubscribe headers if requested
  if (unsubscribePath || bulk) {
    const token = generateUnsubscribeToken(to, userId);
    headers["List-Unsubscribe"] =
      `<${SITE_URL}/api/email/unsubscribe/${token}>, <mailto:no-reply@${MAIL_DOMAIN}>`;
    headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
  }

  const isProd = process.env.NODE_ENV === "production";

  // Retry logic: 2 attempts with exponential backoff
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      if (isProd) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "no-reply@example.com",
          to,
          subject,
          html,
          headers,
        });
      } else {
        const testAccount = await nodemailer.createTestAccount();
        const transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });

        const info = await transporter.sendMail({
          from: process.env.RESEND_FROM_EMAIL || "no-reply@example.com",
          to,
          subject,
          html,
          headers,
        });

        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      }

      logEmailMetrics(options, true);
      return { success: true };
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      if (attempt === 2) {
        logEmailMetrics(options, false, error);
        return { success: false, error };
      }
      // Exponential backoff: wait 1s * attempt
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
}

/**
 * Renders a magic link email using React Email template
 */
export async function renderMagicLinkEmail(
  url: string,
  email?: string,
): Promise<string> {
  try {
    return await render(
      MagicLinkEmail({
        url,
        email,
        brandName: "Gruntworks Agency",
      }),
    );
  } catch (error) {
    console.error(
      "Failed to render React Email template, falling back to basic HTML:",
      error,
    );

    // Fallback to basic HTML template
    return `
      <html>
        <body>
          <h1>Your Magic Link</h1>
          <p>Click <a href="${url}">here</a> to sign in.</p>
          <hr>
          <p style="font-size: 12px; color: #666;">
            If you no longer wish to receive these emails, you can unsubscribe at any time.
          </p>
        </body>
      </html>
    `;
  }
}

/**
 * Simplified legacy function for backward compatibility
 */
export function renderBasicMagicLinkEmail(url: string): string {
  return `
    <html>
      <body>
        <h1>Your Magic Link</h1>
        <p>Click <a href="${url}">here</a> to sign in.</p>
        <hr>
        <p style="font-size: 12px; color: #666;">
          If you no longer wish to receive these emails, you can unsubscribe at any time.
        </p>
      </body>
    </html>
  `;
}

export { sendEmail };
