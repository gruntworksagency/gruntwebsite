import { Resend } from "resend";
import nodemailer from "nodemailer";

type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
  headers?: Record<string, string>;
  bulk?: boolean;
};

async function sendEmail(options: SendEmailOptions) {
  const { to, subject, html, headers = {}, bulk = false } = options;

  if (bulk) {
    // Add one-click unsubscribe header - assuming unsubscribe URL is provided or generated
    // For now, placeholder; in real use, generate proper URL
    headers["List-Unsubscribe"] = "<mailto:unsubscribe@example.com>";
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
      return { success: true };
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      if (attempt === 2) {
        return { success: false, error };
      }
      // Exponential backoff: wait 1s * attempt
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
}

export function renderMagicLinkEmail(url: string): string {
  return `
    <html>
      <body>
        <h1>Your Magic Link</h1>
        <p>Click <a href="${url}">here</a> to sign in.</p>
      </body>
    </html>
  `;
}

export { sendEmail };
