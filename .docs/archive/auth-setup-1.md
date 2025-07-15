RIPER·Ω₄ Active [Session: auth-setup-1]

### Project Plan: Hybrid Authentication Setup for Gating Audit Page (Page-Level Blend)

#### Purpose

Implement a hybrid authentication system using the auth-astro integration (Auth.js) to gate the /audit page with Google and Email providers, without database persistence. Leverage server-side middleware for secure route protection (redirect unauthenticated users to /login) and client-side components for an enhanced login UX (e.g., instant feedback, loading states). Embed SSR/prerender configurations, session redirects, and sign-out handling directly in page frontmatter for intuitive, page-focused logic. Use JWT for sessions (no DB), with a shared auth helper for scoped elements like trustHost and email transporter (via Nodemailer for verification emails). This ensures /audit is only accessible to authenticated users, with personalization (e.g., pre-filled email) on success, aligning with the sprint's focus on package setup and codebase preparation for future persistence.

#### Structure Outline

- **Config Updates**: Enable hybrid output globally in astro.config.mjs for SSR support; set trustHost: true in a new shared auth helper (e.g., src/lib/auth.ts) imported where needed.
- **Middleware Setup**: A single src/middleware.ts file to intercept requests, check sessions via getSession, and redirect unauthenticated users from /audit to /login.
- **Auth Configuration**: A new src/auth.config.ts file to define providers (Google, Email with Nodemailer transporter) and JWT session strategy.
- **Login Page**: A new src/pages/login.astro page with prerender: false in frontmatter, client-side scripts (from auth-astro/client) for sign-in buttons (Google, Email), handling flows with callbacks, loading UX, and a sign-out button via client-side island (calls signOut() with post-logout redirect to /login).
- **Protected Page Updates**: Modify src/pages/audit.astro with prerender: false in frontmatter, session-based redirects if needed, and fetch session data server-side for personalization (e.g., greet user, pre-fill form email); add client-side sign-out island for quick logout.
- **API Handler**: A new src/pages/api/auth/[...auth].ts file to handle all Auth.js routes dynamically, including logout.
- **Environment Variables**: Leverage existing .env for provider secrets and AUTH_SECRET; add Nodemailer config (e.g., SMTP vars) for email verification.
- **Styling/UX**: Reuse existing Preline/Tailwind classes for login page consistency; add client-side hydration for interactive sign-in/out (e.g., client:load) with animations/transitions for enhanced UX.
- **Error Handling**: Basic redirects for auth failures/expired sessions; client-side toasts for sign-out success.
- **Testing**: Manual checks for gating, login/logout flows, personalization, and session persistence.

#### Planned Phases

1. **Setup & Installation**: Install auth-astro, @auth/core, and nodemailer; update astro.config.mjs for hybrid output.
2. **Configuration**: Define providers, JWT strategy, and Nodemailer transporter in auth.config.ts; create shared auth helper for trustHost and imports.
3. **Middleware Development**: Implement session checks and redirects in middleware.ts.
4. **Login Page Creation**: Build login.astro with frontmatter prerender, client-side sign-in/out scripts, and UX enhancements.
5. **Audit Page Enhancements**: Update audit.astro with frontmatter prerender, session-based personalization, and client-side sign-out island.
6. **API & Logout Handling**: Set up dynamic API route for Auth.js, ensuring logout invalidates sessions with redirects.
7. **Testing & Validation**: Test flows (login, gating, sign-out, personalization) in dev mode; verify JWT sessions, email verification, and no DB usage.

#### Required Context

- Dependencies: Astro 5.x, auth-astro, @auth/core (v0.18.6+ for JWT), nodemailer (for email transporter).
- Edge Cases: Handle expired sessions (redirect to login with client-side notification); unauthenticated access attempts; provider errors (e.g., invalid credentials); mobile responsiveness for login UX; email delivery failures.
- Example Snippet (for illustration only, not final code):
  ```astro
  // src/pages/login.astro (example frontmatter with prerender and session redirect)
  ---
  export const prerender = false;
  import { getSession } from 'auth-astro/server';
  const session = await getSession(Astro.request);
  if (session) return Astro.redirect('/audit');
  ---
  ```

ACTION PLAN CHECKLIST:

1. [Run `npx astro add auth-astro` to install and add the integration to astro.config.mjs; manually install nodemailer via `npm add nodemailer`.]
2. [Update astro.config.mjs to set output: 'hybrid' for SSR support across the project.]
3. [Create new file src/lib/auth.ts as a shared helper exporting trustHost: true config and any reusable auth imports.]
4. [Create new file src/auth.config.ts defining Google/Email providers (with Nodemailer transporter using .env SMTP vars) and session: { strategy: 'jwt' }.]
5. [Create new file src/pages/api/auth/[...auth].ts as a dynamic API route handling Auth.js requests via imported auth.handler, including logout.]
6. [Create new file src/middleware.ts with defineMiddleware to check sessions and redirect unauthenticated /audit requests to /login.]
7. [Create new file src/pages/login.astro with prerender: false in frontmatter, MainLayout, sign-in buttons, client-side script importing auth-astro/client for Google/Email flows with loading UX, and a sign-out island calling signOut() with redirect to /login.]
8. [Modify src/pages/audit.astro to add prerender: false in frontmatter, fetch session server-side with getSession for personalization (e.g., greet user, pre-fill email), and include a client-side sign-out island for logout.]
9. [Test in dev mode: verify gating redirects, successful logins/logouts, personalization, email verification, and JWT session persistence without DB.]
