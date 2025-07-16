# Email Service Run-Book

## Overview

This document covers setup, configuration, and testing for the email service using Resend for production and Ethereal for development.

## Environment Variables

- `RESEND_API_KEY`: API key from Resend dashboard.
- `RESEND_FROM_EMAIL`: Verified sender email (e.g., no-reply@gruntworksagency.com).
- `MAIL_DOMAIN`: Your domain (e.g., gruntworksagency.com).
- `NODE_ENV`: Set to 'production' for Resend, otherwise Ethereal.

## DNS Setup for Compliance (SPF, DKIM, DMARC)

1. In Resend dashboard, add and verify your domain to get TXT and DKIM records.
2. In your DNS provider:
   - Add TXT record for domain verification.
   - SPF: `v=spf1 include:spf.resend.com ~all`
   - DKIM: Add CNAME records as provided by Resend.
   - DMARC: `v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com`
3. Wait for Resend to show 'Verified' status.
4. Monitor complaint rate to stay below 0.3%.

## Development Preview

- Set `NODE_ENV=development`.
- Trigger an email (e.g., magic link).
- Check console for Ethereal preview URL and open in browser.

## Testing Guide

- **Unit**: Mock Resend SDK and test retry logic in `email.ts`.
- **Integration**: Run `bunx astro dev`, trigger email, verify preview.
- **E2E**: Use Cypress to intercept auth APIs and simulate link follow.
- **Pre-deploy**: Ensure CI checks for required env vars.

## Webhook Configuration

- Set up webhook in Resend dashboard pointing to `/api/resend/webhook`.
- Monitors events like delivered, bounce, complaint.
