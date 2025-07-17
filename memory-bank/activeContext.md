RIPER·Ω₃ Active [Session: Email-Service-Blueprint]

────────────────────────────────────────
TECHNICAL PLAN — STORIES #1 & #2
────────────────────────────────────────
Scope: Deliver the foundation required for the Resend integration by (1) installing all runtime + dev dependencies and (2) publishing a canonical `.env.example` file so every contributor knows which keys are mandatory.

A. CONTEXT  
• Package manager: **Bun** (`bun install/add`).  
• Email utility stub (`src/lib/email.ts`) already imports `resend`; build currently succeeds because the package is listed in `package.json` (confirmed).  
• `nodemailer` & `@types/nodemailer` appear in `package.json`; we must verify they are on the correct version and locked in `bun.lock` after install.  
• `.env` is in `.gitignore`; there is currently **no** `.env.example` committed.

B. STORY #1 — Install / Verify Dependencies

1. Create feature branch `feat/email-deps`.
2. Commands to execute:
   ```bash
   # runtime SDK
   bun add resend
   # dev-only (type stubs already in project but ensure latest)
   bun add -D nodemailer @types/nodemailer
   ```
3. Audit versions:
   • `resend` ≥ 4.6.0 (latest stable).  
   • `nodemailer` ≥ 7.x (matches @types).
4. Commit: `chore: install Resend SDK and align email deps`
5. Push branch; open PR with CI passing (even though workflows don’t exist yet, keep naming consistent).
6. SUCCESS CRITERIA  
   • `package.json` dependencies list exact versions.  
   • `bun.lock` updated.  
   • `src/lib/email.ts` compiles with no missing module errors.

C. STORY #2 — Create `.env.example`

1. File path: project root `.env.example`.
2. Required keys (uppercase = secret, prefixed with comment):

   ```
   # Resend
   RESEND_API_KEY="re_live_XXXXXXXXXXXXXXXXXXXXXXXX"
   RESEND_FROM_EMAIL="no-reply@gruntworksagency.com"

   # Domain used for SPF/DKIM/DMARC records
   MAIL_DOMAIN="gruntworksagency.com"

   # --- existing project variables (copied for completeness) ---
   DATABASE_URL="postgres://user:pass@localhost:5432/db"
   BETTER_AUTH_SECRET="changeme"
   BETTER_AUTH_URL="http://localhost:4321"
   # …
   ```

3. Add inline comments:
   • Explain that `RESEND_API_KEY` must correspond to a verified domain in Resend dashboard.  
   • Note that `RESEND_FROM_EMAIL` must match `MAIL_DOMAIN` and be verified.
4. Update README or `docs/email.md` with a one-liner pointer:  
   “Copy `.env.example` → `.env` and fill in the blanks before running the app.”
5. Commit: `docs: add .env.example with Resend keys`

D. RISKS & MITIGATIONS  
• Duplicate nodemailer versions — run `bun audit` to surface mismatches.  
• Forgetting to commit `.env.example` — add a pre-commit lint rule (future story).

E. DELIVERABLES  
• Updated `package.json` + `bun.lock`.  
• `.env.example` in repo.  
• PRs merged to `main`.

────────────────────────────────────────
ACTION PLAN CHECKLIST
────────────────────────────────────────

1. [Create feature branch `feat/email-deps`]
2. [Run `bun add resend`]
3. [Run `bun add -D nodemailer @types/nodemailer`]
4. [Commit “chore: install Resend SDK and align email deps”]
5. [Create `.env.example` with RESEND_API_KEY, RESEND_FROM_EMAIL, MAIL_DOMAIN (+ existing vars)]
6. [Update docs to reference `.env.example`]
7. [Commit “docs: add .env.example with Resend keys”]
8. [Open PR(s) and merge after review]

Plan complete. Switch to Execute Agent when ready to implement.

<!-- README_SNIPPET_START
### GitHub Automation – RIPER Helper Script v2
A hardened Bash helper that streamlines feature-branch creation, PR creation, and automated merges.
Now includes pre-flight authentication checks, debug mode, and user-friendly error messages.
Developers can run `scripts/riper-gh.sh branch-and-pr "<slug>"` to open a ready-to-review PR in seconds.
README_SNIPPET_END -->
