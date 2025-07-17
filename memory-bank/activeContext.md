Ran tool
Read file: src/lib/email.ts

RIPER·Ω₃ Active [Session: Audit-Form-Submissions]

────────────────────────────────────────────────────────
COMPREHENSIVE TECHNICAL BLUEPRINT – “Audit Form Submissions”
Approach Selected: Minimal Prisma Model Extension (Approach 1)
────────────────────────────────────────────────────────

0. Purpose & Outcome
   • Persist every audit-form submission in PostgreSQL, strictly linked to the signed-in user.  
   • Capture all business & personal fields already collected in the UI plus status, reviewStatus, notes, createdAt, updatedAt.  
   • Trigger an admin email + optional outbound webhook immediately after successful persistence.  
   • Maintain simple synchronous request flow (no background queue) suited for low daily volume.

1. Data-Model Design (Prisma)
   Model name: `auditSubmission`  
   Key points  
   • Primary key: `id` (ULID/UUID String).  
   • Foreign key: `userId → user.id` (`onDelete: Cascade`).  
   • Timestamps: `createdAt`, `updatedAt`.  
   • Business fields: `businessName`, `businessAddress`, `businessPhone`, `businessWebsite`, `placeId`, `googleBusinessUrl`, `businessTypes`.  
   • Personal fields: `firstName`, `lastName`, `email`, `personalPhone`, `message`.  
   • Workflow metadata: `status` (string, default "new"), `reviewStatus` (string, default "pending"), `notes` (String?)

Example Prisma snippet (illustrative):

```prisma
model auditSubmission {
  id                String   @id @default(uuid())
  userId            String
  businessName      String
  businessAddress   String
  businessPhone     String?
  businessWebsite   String?
  placeId           String   @unique
  googleBusinessUrl String?
  businessTypes     String?

  firstName      String
  lastName       String
  email          String
  personalPhone  String?
  message        String

  status        String   @default("new")
  reviewStatus  String   @default("pending")
  notes         String?

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  user          user     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

2. Migration & Client Generation
   • Run `npx prisma migrate dev --name add-audit-submission` to create SQL migration (later executed in CI/prod).  
   • `prisma generate` will auto-run with the migrate command, producing updated Prisma Client.

3. Server-Side API Endpoint
   Location: `src/pages/api/audit-submission.ts` (Astro API route)

Responsibilities  
a. Guard – allow only POST; ensure valid session (`auth.api.getSession`).  
b. Extract formData fields from `request.formData()`.  
c. Instantiate Prisma client (imported from `@/lib/prisma` or `@prisma/client`).  
d. `prisma.auditSubmission.create({ data: { …fields, userId: session.user.id } })`  
e. Trigger notifications:  
 • Email → use existing `sendEmail()` util to `process.env.ADMIN_EMAIL`.  
 • Webhook → if `process.env.AUDIT_WEBHOOK_URL` exists, `fetch` POST JSON payload.  
f. Respond with 302 redirect back to `/audit?success=1` or JSON success.

Example skeleton:

```ts
// src/pages/api/audit-submission.ts (pseudo)
import type { APIRoute } from "astro";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export const post: APIRoute = async ({ request, redirect }) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const data = Object.fromEntries(await request.formData());
  const submission = await prisma.auditSubmission.create({
    data: { ...data, userId: session.user.id },
  });

  // Email
  await sendEmail({
    to: process.env.ADMIN_EMAIL!,
    subject: "New Audit Submission Received",
    html: `<pre>${JSON.stringify(submission, null, 2)}</pre>`,
  });

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
```

4. Front-End Adjustments (`src/pages/audit.astro`)
   • Add `action="/api/audit-submission"` to `<form>` tag.  
   • On successful redirect with `success=1`, display confirmation banner.  
   Example snippet:

```astro
---
// ... existing code ...
const url = new URL(Astro.request.url);
const isSuccess = url.searchParams.get("success") === "1";
---

{
  isSuccess && (
    <div class="mb-6 rounded-lg bg-green-100 p-4 text-green-800">
      ✅ Thanks! Your audit request has been received.
    </div>
  )
}
<form method="POST" action="/api/audit-submission" id="audit-form">
  // ... existing code ...
</form>
```

5. Utility Layer
   • `src/lib/prisma.ts` – if not present, create singleton Prisma client to avoid hot-reload connection limits.  
   Example:

```ts
import { PrismaClient } from "@prisma/client";
export const prisma = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
```

6. Environment Variables
   Add to `.env.example` / docs:

```
DATABASE_URL=postgres://...
ADMIN_EMAIL=admin@example.com
AUDIT_WEBHOOK_URL=https://hooks.zapier.com/...
```

7. Testing & Validation
   • Local dev: run `npm run dev`, submit form, verify DB row via `psql` or Prisma Studio (`npx prisma studio`).  
   • Unit-test the API route using a mocked `auth` session and in-memory Prisma (or test DB).  
   • Confirm email previews logged in dev (Ethereal) and webhook receives payload.

8. Security & Compliance
   • Server-side validation (e.g., sanitize strings, length limits).  
   • Rate-limit endpoint (reuse Better Auth’s built-in middleware or implement simple rate-limit code).  
   • Ensure `placeId` is unique to avoid duplicates unless intended (unique constraint above).  
   • GDPR: include data-retention policy and ability to delete (future story).

9. Future Extensions (for reference, not implemented here)
   • Convert `status` & `reviewStatus` to true enums.  
   • Add soft-delete (`deletedAt`).  
   • Move notifications to queue (e.g., worker) if volume grows.

────────────────────────────────────────────────────────
ACTION PLAN CHECKLIST

1. Update Prisma schema: add `auditSubmission` model (see §1).
2. Run migration & generate client (`npx prisma migrate dev --name add-audit-submission`).
3. Create `src/lib/prisma.ts` singleton if absent.
4. Implement `src/pages/api/audit-submission.ts` (server logic, email, webhook).
5. Inject environment variables (`ADMIN_EMAIL`, `AUDIT_WEBHOOK_URL`) & document in `.env.example`.
6. Modify `<form>` in `src/pages/audit.astro`: add `action="/api/audit-submission"` and success banner logic.
7. Test end-to-end locally: submit form, verify DB row, email preview, webhook call.
8. Commit changes on feature branch; open PR with migration SQL reviewed.
9. Deploy to staging, run `prisma migrate deploy`; smoke-test production webhook/email flow.
10. Mark story complete, notify stakeholders.

<!-- README_SNIPPET_START
### Feature – Audit Form Submissions
Each audit request is now securely stored in the database and linked to the user who submitted it. Admins receive instant email notifications and can pipe submissions to any system via a configurable webhook URL.
README_SNIPPET_END -->

────────────────────────────────────────────────────────
