Ran tool
Read file: .env.example
Read file: README.md
Ran tool

RIPER·Ω₃ Active [Session: Email-Service-Blueprint-Revision-3]

Acknowledged. This third revision addresses the halted execution by accounting for the current repository state: we are on the new `feat/email-infra-setup` branch post-Git hygiene; core code changes (environment variable loading in `astro.config.mjs`, email utility in `src/lib/email.ts`, and BetterAuth integration in `src/lib/auth.ts`) are already implemented, likely carried over from the previous dangling branch; however, `.env.example` is missing, `README.md` lacks the email setup section, and the outdated plan file needs archiving. The plan focuses on verification, completion of missing elements, and finalization without redundant code changes.

────────────────────────────────────────
**COMPREHENSIVE TECHNICAL PLAN — REVISION 3**
Astro + BetterAuth + Resend Email Service
────────────────────────────────────────

### **A. Updated Context & State Analysis**

- **Git State**: Repository is on the clean `feat/email-infra-setup` branch after switching from `main`, deleting `feat/email-deps`, and running `bun install`. No further Git cleanup needed.
- **Dependencies**: `resend` (^4.6.0) and `nodemailer` (^7.0.5) with types are installed and locked; no additions required.
- **Existing Code Changes**:
  - `astro.config.mjs` already loads and assigns `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `MAIL_DOMAIN` via `loadEnv` and `process.env`.
  - `src/lib/email.ts` has the full environment-aware implementation (Resend for production, Ethereal for development) with retry logic, headers for bulk emails, and a `renderMagicLinkEmail` helper.
  - `src/lib/auth.ts` integrates `sendEmail` into `sendMagicLink`, `sendVerificationEmail`, and `sendPasswordResetToken` hooks.
- **Missing Elements**: No `.env.example` file exists; `README.md` lacks documentation on email setup; outdated plan file (`.docs/archiveContext.md`) needs archiving to `.docs/archive/3.md`.
- **Verification Needs**: Manually confirm the existing implementations match the intended logic to ensure no regressions.
- **Documentation & Finalization**: Add email section to `README.md`; archive plan; commit and prepare PR.

### **B. Phase 1: Verification of Existing Changes**

This phase ensures the pre-existing code aligns with the integration goals without making modifications.

1. **Verify Environment Variable Loading (`astro.config.mjs`)**:
   - Confirm the destructuring includes `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `MAIL_DOMAIN`.
   - Check assignments to `process.env` for server-side access.
   - **Snippet Example** (marked as such; for verification only):
     ```js
     // Expected structure
     const { ..., RESEND_API_KEY, RESEND_FROM_EMAIL, MAIL_DOMAIN } = loadEnv(...);
     process.env.RESEND_API_KEY = RESEND_API_KEY;
     process.env.RESEND_FROM_EMAIL = RESEND_FROM_EMAIL;
     process.env.MAIL_DOMAIN = MAIL_DOMAIN;
     ```

2. **Verify Email Utility (`src/lib/email.ts`)**:
   - Confirm production uses Resend, development uses Ethereal with preview logging.
   - Check for retry logic, bulk headers (e.g., one-click unsubscribe), and email rendering helper.
   - **Snippet Example** (marked as such; for verification only):
     ```ts
     // Expected production send
     const resend = new Resend(process.env.RESEND_API_KEY);
     await resend.emails.send({
       from: process.env.RESEND_FROM_EMAIL,
       to,
       subject,
       html,
       headers,
     });
     ```

3. **Verify BetterAuth Integration (`src/lib/auth.ts`)**:
   - Confirm `sendEmail` is called in `sendMagicLink`, `sendVerificationEmail`, and `sendPasswordResetToken` with appropriate subjects and HTML.
   - **Snippet Example** (marked as such; for verification only):
     ```ts
     // Expected magic link
     await sendEmail({
       to: email,
       subject: "Your Magic Link",
       html: renderMagicLinkEmail(url),
     });
     ```

### **C. Phase 2: Complete Missing Configurations**

1. **Create `.env.example` File**:
   - Path: Project root (e.g., `./.env.example`).
   - Include all existing variables plus Resend-specific ones for easy setup.
   - **Content Example** (marked as such; not final code):

     ```
     # Database
     DATABASE_URL="postgres://user:pass@localhost:5432/db"

     # BetterAuth
     BETTER_AUTH_SECRET="changeme"
     BETTER_AUTH_URL="http://localhost:4321"

     # Google
     GOOGLE_CLIENT_ID=""
     GOOGLE_CLIENT_SECRET=""
     PUBLIC_GOOGLE_MAPS_API_KEY=""

     # Resend Email Service
     RESEND_API_KEY="re_live_XXXXXXXXXXXXXXXXXXXXXXXX"  # Obtain from Resend dashboard; must be for a verified domain
     RESEND_FROM_EMAIL="no-reply@yourdomain.com"  # Must match a verified sender in Resend
     MAIL_DOMAIN="yourdomain.com"  # Used for SPF/DKIM/DMARC setup
     ```

### **D. Phase 3: Documentation Updates**

1. **Update `README.md`**:
   - Add a new section under "Getting Started" or "Installation" to guide users on email setup.
   - **Content Example** (marked as such; shows insertion point and structure):

     ```
     ## Email Service Setup

     Copy `.env.example` to `.env` and fill in your values. For email, sign up at Resend, verify your domain, and add the API key. Ensure SPF, DKIM, and DMARC records are set up for compliance.
     ```

### **E. Phase 4: Archiving and Finalization**

1. **Archive Old Plan**:
   - Move the superseded plan file to prevent confusion.
   - **Command**: `mv .docs/archiveContext.md .docs/archive/3.md`

2. **Commit and PR**:
   - Stage all changes (new `.env.example`, updated `README.md`).
   - Commit with a message like "feat: complete Resend email integration setup".
   - Push and open a PR to `main` for review.

────────────────────────────────────────
**ACTION PLAN CHECKLIST**
────────────────────────────────────────

1. [Verify environment variable loading in `astro.config.mjs` matches the expected destructuring and assignments for Resend vars]
2. [Verify email utility logic in `src/lib/email.ts` includes production Resend, development Ethereal, retries, and bulk headers]
3. [Verify BetterAuth hooks in `src/lib/auth.ts` call `sendEmail` with correct params for magic links, verification, and resets]
4. [Create `.env.example` in project root with all variables including Resend keys]
5. [Update `README.md` by adding an "Email Service Setup" section under "Getting Started"]
6. [Archive the outdated plan file with `mv .docs/archiveContext.md .docs/archive/3.md`]
7. [Commit all changes (new file and README update) with message "feat: complete Resend email integration setup"]
8. [Push the branch and open a PR to main for review and merge]

Plan complete. Switch to Execute Agent when ready to implement.
