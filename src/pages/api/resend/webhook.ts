import type { APIRoute } from "astro";

// TODO: Implement proper webhook verification using Svix or Resend's recommended method
// import { Webhook } from 'svix'; // If using Svix

export const POST: APIRoute = async ({ request }) => {
  const body = await request.text();
  // const signature = request.headers.get('svix-signature') || '';

  // Temporary skip verification for development
  // const isValid = verifyWebhook(body, signature, 'secret');

  // if (!isValid) return new Response('Invalid signature', { status: 401 });

  const event = JSON.parse(body);
  console.log("Resend Webhook Event:", event.type, event.data);

  if (event.type === "email.bounced" || event.type === "email.complained") {
    console.warn("Email issue:", event.type, event.data.email);
  }

  return new Response("OK", { status: 200 });
};
