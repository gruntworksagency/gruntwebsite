import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";
import { Pool } from "pg";
import { sendEmail, renderMagicLinkEmail } from "./email";

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
    sendVerificationEmail: async ({
      email,
      url,
    }: {
      email: string;
      url: string;
    }) => {
      await sendEmail({
        to: email,
        subject: "Verify Your Email",
        html: renderMagicLinkEmail(url), // Reuse for simplicity; customize if needed
      });
    },
    sendPasswordResetToken: async ({
      email,
      url,
    }: {
      email: string;
      url: string;
    }) => {
      await sendEmail({
        to: email,
        subject: "Reset Your Password",
        html: renderMagicLinkEmail(url), // Reuse for simplicity
      });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }: { email: string; url: string }) => {
        await sendEmail({
          to: email,
          subject: "Your Magic Link",
          html: renderMagicLinkEmail(url),
        });
      },
    }),
  ],
  // Built-in security features
  rateLimit: {
    enabled: true,
    window: 15 * 60 * 1000, // 15 minutes
    max: 100, // requests per window
  },
});
