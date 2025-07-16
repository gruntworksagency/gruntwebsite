# Email Platform Documentation

## Overview

This documentation covers the complete email platform implementation including deliverability testing, DNS authentication, bounce/complaint handling, and compliance requirements.

## Table of Contents

1. [Quick Start](#quick-start)
2. [DNS Authentication Setup](#dns-authentication-setup)
3. [Environment Variables](#environment-variables)
4. [Testing & Deliverability](#testing--deliverability)
5. [Webhook Configuration](#webhook-configuration)
6. [Unsubscribe System](#unsubscribe-system)
7. [Monitoring & Observability](#monitoring--observability)
8. [Compliance & Best Practices](#compliance--best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Quick Start

### 1. Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required variables:

```env
RESEND_API_KEY="re_live_XXXXXXXXXXXXXXXXXXXXXXXX"
RESEND_FROM_EMAIL="no-reply@yourdomain.com"
MAIL_DOMAIN="yourdomain.com"
RESEND_WEBHOOK_SECRET="whsec_XXXXXXXXXXXXXXXXXXXXX"
RESEND_JWT_SECRET="your-secure-jwt-secret-here"
```

### 2. Database Migration

```bash
bunx prisma db push
bunx prisma generate
```

### 3. Test Email Delivery

```bash
bun run scripts/email-test.ts
```

---

## DNS Authentication Setup

Proper DNS configuration is **crucial** for email deliverability. Configure these records in your domain's DNS:

### SPF Record

```
Type: TXT
Name: @
Value: v=spf1 include:spf.resend.com ~all
```

### DKIM Records

1. Go to your Resend dashboard
2. Navigate to your domain settings
3. Copy the DKIM CNAME records provided
4. Add them to your DNS provider

Example DKIM records:

```
Type: CNAME
Name: resend._domainkey
Value: resend._domainkey.yourdomain.resend.com

Type: CNAME
Name: resend2._domainkey
Value: resend2._domainkey.yourdomain.resend.com
```

### DMARC Record

```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com; ruf=mailto:dmarc@yourdomain.com; fo=1
```

**Important Notes:**

- Start with `p=none` for testing, then move to `p=quarantine` after verification
- Monitor DMARC reports before setting to `p=reject`
- Replace `yourdomain.com` with your actual domain

### Verification Tools

- [MXToolbox](https://mxtoolbox.com/spf.aspx) - SPF checker
- [DMARC Analyzer](https://www.dmarcanalyzer.com/) - DMARC validation
- [Mail Tester](https://www.mail-tester.com/) - Overall deliverability

---

## Environment Variables

### Required Variables

| Variable                | Description                        | Example                   |
| ----------------------- | ---------------------------------- | ------------------------- |
| `RESEND_API_KEY`        | Resend API key (starts with `re_`) | `re_live_abc123...`       |
| `RESEND_FROM_EMAIL`     | Verified sender email address      | `no-reply@yourdomain.com` |
| `MAIL_DOMAIN`           | Your verified domain               | `yourdomain.com`          |
| `RESEND_WEBHOOK_SECRET` | Webhook signature verification     | `whsec_abc123...`         |
| `RESEND_JWT_SECRET`     | JWT signing for unsubscribe tokens | `secure-random-string`    |

### Optional Variables

| Variable          | Description                      | Default                 |
| ----------------- | -------------------------------- | ----------------------- |
| `BETTER_AUTH_URL` | Site URL for unsubscribe links   | `http://localhost:4321` |
| `SENTRY_DSN`      | Error tracking (if using Sentry) | -                       |

### Security Best Practices

- Use strong, random values for `RESEND_JWT_SECRET` (32+ characters)
- Store secrets in environment variables, never in code
- Rotate webhook secrets periodically
- Use different keys for staging/production

---

## Testing & Deliverability

### Automated Testing

Run the deliverability test script:

```bash
# Test with default recipients
bun run scripts/email-test.ts

# Test with custom recipient
bun run scripts/email-test.ts test@yourdomain.com
```

The script will:

- ✅ Validate environment variables
- 📧 Send test emails to mail-tester.com
- 🔍 Check DNS configuration guidance
- 📊 Provide actionable recommendations

### Manual Testing Checklist

1. **SpamAssassin Score**: Aim for ≤ 3 points
2. **Inbox Placement**: Test with major providers (Gmail, Outlook, Apple)
3. **Authentication**: Verify SPF, DKIM, DMARC pass
4. **Content**: Avoid spam trigger words
5. **Images**: Test with images blocked/enabled
6. **Mobile**: Check mobile email client rendering

### Testing Services

- [Mail Tester](https://www.mail-tester.com/) - Free SpamAssassin analysis
- [GlockApps](https://glockapps.com/) - Inbox placement testing
- [Litmus](https://www.litmus.com/) - Email rendering across clients
- [EmailOnAcid](https://www.emailonacid.com/) - Comprehensive testing

---

## Webhook Configuration

### Resend Dashboard Setup

1. Go to Resend Dashboard → Webhooks
2. Add endpoint: `https://yourdomain.com/api/resend/webhook`
3. Select events:
   - `email.sent`
   - `email.delivered`
   - `email.bounced`
   - `email.complained`
   - `email.opened`
   - `email.clicked`
4. Copy the webhook secret to `RESEND_WEBHOOK_SECRET`

### Event Handling

The webhook automatically:

- ✅ Verifies signatures using Svix
- 📊 Tracks email metrics
- 🚫 Auto-unsubscribes hard bounces and complaints
- 🔔 Alerts on high complaint rates (>0.1%)
- 📝 Logs structured events for monitoring

### Supported Events

| Event              | Description              | Auto Action                    |
| ------------------ | ------------------------ | ------------------------------ |
| `email.sent`       | Email accepted by Resend | Metrics update                 |
| `email.delivered`  | Successfully delivered   | Metrics update                 |
| `email.bounced`    | Bounce (soft/hard)       | Hard bounce → auto-unsubscribe |
| `email.complained` | Spam complaint           | Auto-unsubscribe               |
| `email.opened`     | Email opened             | Metrics update                 |
| `email.clicked`    | Link clicked             | Metrics update                 |

---

## Unsubscribe System

### One-Click Unsubscribe (RFC 8058)

Automatically added to bulk emails:

```
List-Unsubscribe: <https://yourdomain.com/api/email/unsubscribe/TOKEN>, <mailto:no-reply@yourdomain.com>
List-Unsubscribe-Post: List-Unsubscribe=One-Click
```

### Token Security

- JWT tokens signed with `RESEND_JWT_SECRET`
- 7-day expiration for security
- Contains email and optional user ID
- Tamper-proof and verifiable

### Database Tracking

All unsubscribes stored in `Unsubscribe` table:

```sql
-- Check unsubscribed emails
SELECT email, reason, createdAt
FROM "Unsubscribe"
ORDER BY createdAt DESC;

-- Suppressed email count
SELECT COUNT(*) as suppressed_count
FROM "Unsubscribe";
```

### Manual Unsubscribe Management

```typescript
// Check if email is unsubscribed
const isUnsubscribed = await prisma.unsubscribe.findFirst({
  where: { email: "user@example.com" },
});

// Manually unsubscribe
await prisma.unsubscribe.create({
  data: {
    email: "user@example.com",
    reason: "manual-admin-request",
  },
});
```

---

## Monitoring & Observability

### Metrics Tracking

Real-time metrics tracked:

- 📤 Emails sent
- ✅ Successful deliveries
- ❌ Bounces (soft/hard)
- 🚨 Spam complaints
- 👁️ Opens and clicks

### Alerting

Automatic alerts for:

- Complaint rate > 0.1%
- Hard bounce rate > 5%
- Webhook processing errors
- Authentication failures

### Sentry Integration

```typescript
// Automatic error tracking in:
// - Email sending failures
// - Webhook processing errors
// - High complaint rate alerts
// - Token validation failures
```

### Grafana Dashboard (Optional)

Export metrics to Prometheus/Grafana:

```bash
# Example cron job for metrics export
0 */6 * * * /usr/local/bin/export-email-metrics.sh
```

---

## Compliance & Best Practices

### CAN-SPAM Act Compliance

✅ **Required Elements:**

- Clear sender identification
- Truthful subject lines
- One-click unsubscribe option
- Physical address in footer
- Honor unsubscribe requests within 10 days

### GDPR Considerations

✅ **Data Protection:**

- Store minimal email data
- Provide data export capabilities
- Honor deletion requests
- Maintain consent records

### Gmail/Yahoo 2024 Requirements

✅ **Bulk Sender Requirements:**

- SPF or DKIM authentication (we use both)
- DMARC policy configured
- One-click unsubscribe headers
- Spam complaint rate < 0.1%
- Valid reverse DNS record

### Rate Limiting

Resend limits:

- Free: 100 emails/day
- Pro: 50,000 emails/month
- Scale: Custom limits

Implement gradual volume increases for new domains.

---

## Troubleshooting

### Common Issues

#### 1. High Spam Score

**Symptoms:** Emails going to spam, high SpamAssassin score

**Solutions:**

- Remove spam trigger words
- Add proper authentication records
- Include plain text version
- Verify sender reputation

#### 2. Authentication Failures

**Symptoms:** DKIM/SPF failures in headers

**Solutions:**

```bash
# Check DNS records
dig TXT yourdomain.com
dig TXT _dmarc.yourdomain.com
dig CNAME resend._domainkey.yourdomain.com
```

#### 3. Webhook Signature Errors

**Symptoms:** `Invalid signature` errors in logs

**Solutions:**

- Verify `RESEND_WEBHOOK_SECRET` matches dashboard
- Check webhook URL is publicly accessible
- Ensure HTTPS with valid certificate

#### 4. Unsubscribe Token Errors

**Symptoms:** "Invalid or expired token" errors

**Solutions:**

- Check `RESEND_JWT_SECRET` consistency
- Verify token hasn't expired (7 days)
- Ensure base64 encoding is correct

### Debug Commands

```bash
# Test environment variables
bun run scripts/email-test.ts

# Check Prisma connection
bunx prisma db pull

# Verify DNS records
dig TXT yourdomain.com
dig TXT _dmarc.yourdomain.com

# Test webhook endpoint
curl -X POST https://yourdomain.com/api/resend/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### Support Resources

- [Resend Documentation](https://resend.com/docs)
- [RFC 8058 - One-Click Unsubscribe](https://tools.ietf.org/html/rfc8058)
- [Gmail Sender Guidelines](https://support.google.com/mail/answer/81126)
- [DMARC.org](https://dmarc.org/)

---

## Migration Notes

If migrating from an existing email system:

1. **Export suppression lists** from old provider
2. **Import into Unsubscribe table** to maintain compliance
3. **Gradually increase volume** to warm up domain reputation
4. **Monitor metrics closely** during transition period
5. **Keep old system running** until fully validated

---

_Last updated: Phase 2 Implementation_
_For questions or issues, contact the development team_
