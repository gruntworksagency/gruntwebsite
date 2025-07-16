# GitHub Secrets Verification Guide

## Quick Test Commands

Run these commands in your terminal to verify the secrets are configured:

```bash
# 1. Check GitHub CLI authentication
gh auth status

# 2. List repository secrets
gh secret list

# 3. Check for required secrets
gh secret list | grep -E "(RESEND_API_KEY|RESEND_FROM_EMAIL|MAIL_DOMAIN|RESEND_WEBHOOK_SECRET|RESEND_JWT_SECRET)"
```

## Expected Results

You should see all 5 required secrets listed:

- ✅ RESEND_API_KEY
- ✅ RESEND_FROM_EMAIL
- ✅ MAIL_DOMAIN
- ✅ RESEND_WEBHOOK_SECRET
- ✅ RESEND_JWT_SECRET

## Testing the GitHub Actions Workflow

I've created `.github/workflows/verify-env.yml` which will automatically test your secrets when you:

1. **Push to any branch** (feat/_, fix/_, main, master)
2. **Create a pull request** to main/master

### To trigger the test:

```bash
# Add the workflow file
git add .github/workflows/verify-env.yml

# Commit it
git commit -m "ci: add email environment variables verification workflow"

# Push to trigger the workflow
git push origin fix/1752678225-email-ci-fix
```

### What the workflow tests:

1. ✅ **Presence Check**: All 5 secrets are set
2. ✅ **Format Validation**:
   - RESEND*API_KEY starts with "re*"
   - RESEND_FROM_EMAIL is valid email format
   - MAIL_DOMAIN is valid domain format
3. ✅ **Domain Consistency**: FROM_EMAIL domain matches MAIL_DOMAIN
4. ✅ **Build Test**: Project builds successfully with email config

### View Results:

1. Go to your repository on GitHub
2. Click the **Actions** tab
3. Look for the "Verify Email Environment Variables" workflow
4. Click on the latest run to see detailed results

## Manual Secret Verification

If the GitHub CLI isn't working, you can manually verify via the GitHub website:

1. Go to: https://github.com/gruntworksagency/gruntwebsite/settings/secrets/actions
2. Verify all 5 secrets are listed (you won't see values, just names)
3. If any are missing, click "New repository secret" to add them

## Troubleshooting

### If secrets are missing:

- Verify you have admin access to the repository
- Check you're looking at repository secrets (not environment secrets)
- Ensure secret names match exactly (case-sensitive)

### If workflow fails:

- Check the Actions tab for detailed error messages
- Verify secret values are correct (no extra spaces, correct formats)
- Ensure your Resend account has the domain verified

## Secret Values Reference

Your secrets should follow these patterns:

```bash
RESEND_API_KEY="re_live_xxxxxxxxxxxxxxxxx"
RESEND_FROM_EMAIL="no-reply@yourdomain.com"
MAIL_DOMAIN="yourdomain.com"
RESEND_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxx"
RESEND_JWT_SECRET="<32+ character random string>"
```
