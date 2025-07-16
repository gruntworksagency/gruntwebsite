RIPER·Ω₃ Active [Session ID: Email-Service-Blueprint – Phase 2]

────────────────────────────────────────
COMPREHENSIVE TECHNICAL PLAN  
“Production-ready Email Layer” – Phase 2 Scope
────────────────────────────────────────

PURPOSE  
Finish the Resend integration by closing all outstanding gaps: inbox-placement testing, one-click unsubscribe, bounce/complaint suppression, CI guards for env-vars, runtime monitoring, and template upgrade. End-state = a compliant, observable, low-maintenance email platform.

ASSUMPTIONS  
• Resend SDK, `src/lib/email.ts`, and basic BetterAuth hooks already exist (Phase 1 done).  
• PostgreSQL via Prisma is available for persistence.  
• GitHub Actions is acceptable CI.  
• Sentry is the agreed error-tracking SAAS.

STRUCTURE OVERVIEW  
src/  
├── lib/  
│ ├── email.ts ← broadened utility (unsubscribe, metrics)  
│ └── templates/ ← React-Email or MJML sources  
├── pages/  
│ └── api/  
│ ├── email/  
│ │ └── unsubscribe/[token].ts ← one-click endpoint  
│ └── resend/webhook.ts ← verified event receiver  
└── prisma/  
 └── schema.prisma (Bounce, Complaint, Unsubscribe models)

PHASE BREAKDOWN
─────────────────
Phase 0 – Branch & Secrets  
• Git: `git checkout -b feat/email-phase2`  
• GitHub repo secrets: `RESEND_WEBHOOK_SECRET`, `SENTRY_DSN`, `GMAIL_POSTMASTER_JSON` etc.

Phase 1 – Enhance `src/lib/email.ts`

1. Accept optional `unsubscribePath` param and auto-compose:  
   – Header `List-Unsubscribe: <https://site.com/api/email/unsubscribe/${token}>, <mailto:no-reply@${MAIL_DOMAIN}>`  
   – Header `List-Unsubscribe-Post: List-Unsubscribe=One-Click`
2. Generate HMAC-signed token (userId, email, exp) via `jwt-simple` (example snippet).
3. Emit structured logs + Sentry breadcrumb on each send.

Phase 2 – One-Click Unsubscribe Flow

1. Prisma: new `Unsubscribe` table (id, email, userId?, reason, ts).
2. Endpoint `GET /api/email/unsubscribe/[token]`  
   – Verify JWT → insert row → return lightweight confirmation page (Astro component).
3. Update marketing/transactional senders to pass `unsubscribePath`.

Phase 3 – Bounce / Complaint Monitoring

1. Install `svix` (`bun add svix`) for webhook signature verification.
2. Expand `src/pages/api/resend/webhook.ts`:  
   – Verify `svix-signature` using `RESEND_WEBHOOK_SECRET`.  
   – For `email.bounced`, `email.complained` → upsert into `Bounce`/`Complaint` tables and optionally auto-unsubscribe.
3. Add metric counters (`@badrap/email-stats` or custom) and Sentry alerts on >0.1 % complaint rate.

Phase 4 – Deliverability / Inbox-Placement Testing Toolkit

1. Script `scripts/email-test.ts`:  
   – Sends sample template to `test@inbox.mail-tester.com`.  
   – Outputs SpamAssassin score + DKIM/SPF/DMARC status.
2. README section: how to run, interpret, iterate.
3. Optional: seed-list testing via GlockApps free tier.

Phase 5 – CI Guardrails

1. `.github/workflows/verify-env.yml`  
   – Uses `dotenv-linter` + custom step to assert non-empty `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `MAIL_DOMAIN`, `RESEND_WEBHOOK_SECRET`.  
   – Fails PR if any missing in deployment target.
2. Add `pnpm test:email` in workflow to run deliverability script against staging key.

Phase 6 – Observability & Dashboards

1. Sentry integration: init in `email.ts` and `webhook.ts`.
2. Google Postmaster Tools: document JSON key setup; export daily metrics to BigQuery (optional stretch).
3. Grafana Cloud or Prometheus endpoint for bounce/complaint gauges (simple crontab export).

Phase 7 – Template System Upgrade

1. Introduce React-Email (or MJML) under `src/lib/templates/`; example: `MagicLink.tsx`, `PasswordReset.tsx`.
2. Build step to render to HTML string inside `email.ts`.
3. Theming tokens and preview storybook page (dev-only route `/emails/preview?type=magicLink&email=alice@x.com`).

Phase 8 – Documentation

1. Update `.docs/email.md` with:  
   – DNS auth checklist (SPF, DKIM, DMARC p=quarantine).  
   – How to test inbox placement.  
   – Webhook event catalogue & suppression policy.
2. README quick-start already amended (Phase 1); cross-link new doc.

Phase 9 – QA & Roll-out

1. Unit tests for:  
   – Token generation/validation.  
   – Webhook signature.
2. Manual flow: sign-up → receive magic-link → unsubscribe → ensure table entry → second email suppressed.
3. Stage branch → run mail-tester (score ≤ 3) → merge via PR.

EXAMPLE SNIPPETS (non-executable, illustrative only)

```ts
// email.ts – adding unsubscribe header (example)
const token = jwt.encode(
  { e: to, exp: Date.now() + 7 * 864e5 },
  RESEND_JWT_SECRET,
);
headers["List-Unsubscribe"] =
  `<${SITE_URL}/api/email/unsubscribe/${token}>, <mailto:no-reply@${MAIL_DOMAIN}>`;
headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
```

```ts
// webhook.ts – event dispatch skeleton
switch (event.type) {
  case 'email.bounced':
  case 'email.complained':
    await prisma.suppression.upsert({ ... });
    break;
}
```

────────────────────────────────────────
ACTION PLAN CHECKLIST

1. [Create branch `feat/email-phase2`]
2. [Prisma: add Bounce, Complaint, Unsubscribe models]
3. [Enhance `src/lib/email.ts` for unsubscribe headers + JWT]
4. [Generate one-click token helper in `src/lib/email.ts`]
5. [Add API route: `src/pages/api/email/unsubscribe/[token].ts`]
6. [Install & configure `svix`; update `src/pages/api/resend/webhook.ts`]
7. [Implement suppression logic into webhook handler]
8. [Add React-Email (or MJML) template system under `src/lib/templates/`]
9. [Migrate existing HTML into `MagicLink.tsx` etc.]
10. [Write `scripts/email-test.ts` deliverability tester]
11. [Create `.github/workflows/verify-env.yml` CI guard]
12. [Integrate Sentry & metrics logging in email + webhook utilities]
13. [Draft `.docs/email.md` with testing & compliance guide]
14. [QA: unit tests + manual end-to-end flow]
15. [Run mail-tester; ensure score ≤3; update docs if not]
16. [Commit, push, open PR titled “feat: email platform phase 2”]
17. [Team review & merge; schedule production DNS DMARC change to `p=quarantine`]

────────────────────────────────────────
(End of PLAN. Awaiting EXECUTE command.)
