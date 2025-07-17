import type { APIRoute } from "astro";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export const post: APIRoute = async ({ request, redirect }) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const data = Object.fromEntries(await request.formData());

  // Validate required fields
  const requiredFields = [
    "businessName",
    "placeId",
    "firstName",
    "lastName",
    "email",
    "message",
  ];
  for (const field of requiredFields) {
    if (!data[field]) {
      return new Response(`Missing required field: ${field}`, { status: 400 });
    }
  }

  const submission = await prisma.auditSubmission.create({
    data: {
      userId: session.user.id,
      businessName: data.businessName as string,
      businessAddress: (data.businessAddress as string) || null,
      businessPhone: (data.businessPhone as string) || null,
      businessWebsite: (data.businessWebsite as string) || null,
      placeId: data.placeId as string,
      googleBusinessUrl: (data.googleBusinessUrl as string) || null,
      businessTypes: (data.businessTypes as string) || null,
      firstName: data.firstName as string,
      lastName: data.lastName as string,
      email: data.email as string,
      personalPhone: (data.personalPhone as string) || null,
      message: data.message as string,
    },
  });

  // Email
  if (process.env.ADMIN_EMAIL) {
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: "New Audit Submission Received",
      html: `<pre>${JSON.stringify(submission, null, 2)}</pre>`,
    }).catch(console.error);
  }

  // Webhook
  if (process.env.AUDIT_WEBHOOK_URL) {
    await fetch(process.env.AUDIT_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submission),
    }).catch(console.error);
  }

  return redirect("/audit?success=1");
};
