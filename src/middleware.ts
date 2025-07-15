import { defineMiddleware } from "astro:middleware";
import { auth } from "./lib/auth";

export const onRequest = defineMiddleware(
  async ({ locals, request, url, redirect }, next) => {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    locals.user = session?.user
      ? {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          image: session.user.image || undefined,
        }
      : null;
    locals.session = session?.session || null;

    // Check if accessing protected audit page
    if (url.pathname === "/audit") {
      if (!session?.user) {
        // Redirect to login if no session
        return redirect("/login?error=unauthorized");
      }

      console.log("User accessing audit page:", session.user.email);
    }

    // Continue to the next middleware or page
    return next();
  },
);
