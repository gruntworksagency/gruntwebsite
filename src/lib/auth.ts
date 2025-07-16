import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";
import { Pool } from "pg";

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  plugins: [
    magicLink({
      sendMagicLink: async (
        { email, url, token }: { email: string; url: string; token: string },
        request: any,
      ) => {
        // For development, we'll log the magic link to console
        // In production, you would send this via email service
        console.log("\n🔗 Magic Link for", email);
        console.log("Click this link to sign in:", url);
        console.log("Token:", token);
        console.log("Copy this URL to your browser:", url, "\n");

        // TODO: Replace with actual email service like Resend, SendGrid, or Nodemailer
        // Example:
        // await sendEmail({
        //   to: email,
        //   subject: "Magic Link Sign In",
        //   html: `<p>Click <a href="${url}">here</a> to sign in to your account.</p>`
        // });
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
