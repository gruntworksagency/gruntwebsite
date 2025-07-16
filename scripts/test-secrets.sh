#!/bin/bash

# Test script to verify GitHub repository secrets are configured
# This script uses GitHub CLI to check repository secrets

set -e

echo "🔍 Testing GitHub Repository Secrets Configuration"
echo "=================================================="

# Check if gh CLI is authenticated
if ! gh auth status > /dev/null 2>&1; then
    echo "❌ GitHub CLI is not authenticated. Run 'gh auth login' first."
    exit 1
fi

echo "✅ GitHub CLI is authenticated"

# Get repository info
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo "📁 Repository: $REPO"

# Check if secrets exist (GitHub CLI can list secret names but not values for security)
echo ""
echo "🔐 Checking repository secrets..."

SECRETS=$(gh secret list --json name -q '.[].name' 2>/dev/null || echo "")

if [ -z "$SECRETS" ]; then
    echo "❌ No secrets found or insufficient permissions to list secrets"
    echo "Make sure you have admin access to the repository"
    exit 1
fi

echo "Found secrets:"
echo "$SECRETS" | while read -r secret; do
    echo "  ✅ $secret"
done

# Check for required email secrets
REQUIRED_SECRETS=(
    "RESEND_API_KEY"
    "RESEND_FROM_EMAIL"
    "MAIL_DOMAIN"
    "RESEND_WEBHOOK_SECRET"
    "RESEND_JWT_SECRET"
)

echo ""
echo "🧪 Verifying required email secrets..."

MISSING_SECRETS=()
for secret in "${REQUIRED_SECRETS[@]}"; do
    if echo "$SECRETS" | grep -q "^$secret$"; then
        echo "  ✅ $secret is configured"
    else
        echo "  ❌ $secret is missing"
        MISSING_SECRETS+=("$secret")
    fi
done

if [ ${#MISSING_SECRETS[@]} -eq 0 ]; then
    echo ""
    echo "🎉 All required email secrets are configured!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Push a change to trigger the GitHub Actions workflow"
    echo "2. Check the Actions tab for the 'Verify Email Environment Variables' workflow"
    echo "3. Ensure the workflow passes successfully"
else
    echo ""
    echo "❌ Missing secrets detected!"
    echo "Please add the following secrets to your repository:"
    echo "Repository Settings > Secrets and variables > Actions > New repository secret"
    echo ""
    for secret in "${MISSING_SECRETS[@]}"; do
        echo "  • $secret"
    done
    echo ""
    echo "Refer to the repository documentation for the correct values."
    exit 1
fi 