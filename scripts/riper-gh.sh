#!/usr/bin/env bash
# RIPER GitHub CLI Helper Script
# Wrapper for common RIPER GitHub-CLI operations

set -euo pipefail

# Configuration
ACTIVE_CTX_PATH="memory-bank/activeContext.md"
DEBUG=${DEBUG:-}

# Enable debug mode if requested
[[ -n $DEBUG ]] && set -x

# Pre-flight check function
check_gh() {
  echo "🔍 Checking GitHub CLI authentication..."
  if ! gh auth status >/dev/null 2>&1; then
    echo "❌ GitHub CLI not authenticated. Run 'gh auth login' first."
    exit 2
  fi
  
  echo "📁 Verifying repository access..."
  if ! gh repo view >/dev/null 2>&1; then
    echo "❌ Not inside a GitHub repository or insufficient permissions."
    exit 2
  fi
  
  echo "✅ GitHub CLI ready"
}

# Function to update changelog
update_changelog() {
  local action="$1"
  local title="$2"
  local details="$3"
  local branch_or_url="$4"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  local changelog_file="memory-bank/changelog.md"
  
  # Create changelog if it doesn't exist
  if [[ ! -f "$changelog_file" ]]; then
    echo "# RIPER Changelog" > "$changelog_file"
    echo "" >> "$changelog_file"
    echo "Auto-generated log of RIPER workflow actions." >> "$changelog_file"
    echo "" >> "$changelog_file"
  fi
  
  # Add entry to changelog
  {
    echo "## $timestamp - $action"
    echo "**Title:** $title"
    echo "**Details:** $details"
    echo "**Branch/URL:** $branch_or_url"
    echo ""
  } >> "$changelog_file"
  
  echo "Updated changelog: $changelog_file"
}

cmd="${1:-}"; shift || true

case "$cmd" in
  branch-and-pr)
    check_gh
    slug="$1"
    ts=$(date +%s)
    branch="feature/${ts}-${slug}"
    echo "Creating branch: $branch"
    git checkout -b "$branch"
    git add "$ACTIVE_CTX_PATH" docs/ || true
    if ! git commit -m "PLAN: ${slug}" 2>/dev/null; then
      echo "ℹ️  Nothing to commit, continuing..."
    fi
    git push -u origin HEAD
    echo "Creating PR with gh CLI..."
    gh pr create --fill --title "feat: ${slug}" --body-file "$ACTIVE_CTX_PATH"
    pr_url=$(gh pr view --json url -q .url)
    echo "PR created: $pr_url"
    echo "$pr_url" > .riper-pr-url
    
    # Update changelog
    update_changelog "BRANCH_AND_PR" "feat: ${slug}" "Created feature branch and pull request" "$pr_url"
    ;;
  merge)
    check_gh
    pr_url="$1"
    echo "Merging PR: $pr_url"
    
    # Get PR title before merging
    pr_title=$(gh pr view "$pr_url" --json title -q .title)
    
    gh pr merge --squash --delete-branch "$pr_url"
    rm -f .riper-pr-url
    
    # Update changelog
    update_changelog "MERGE" "$pr_title" "Successfully merged and deleted branch" "$pr_url"
    ;;
  close)
    check_gh
    pr_url="$1"
    comment="${2:-closed by RIPER}"
    echo "Closing PR: $pr_url with comment: $comment"
    
    # Get PR title before closing
    pr_title=$(gh pr view "$pr_url" --json title -q .title)
    
    gh pr close "$pr_url" --comment "$comment"
    rm -f .riper-pr-url
    
    # Update changelog
    update_changelog "CLOSE" "$pr_title" "Closed PR: $comment" "$pr_url"
    ;;
  branch-fix)
    check_gh
    slug="$1"
    ts=$(date +%s)
    branch="fix/${ts}-${slug}"
    echo "Creating fix branch: $branch"
    git checkout main && git pull
    git checkout -b "$branch"
    echo "Fix branch created: $branch"
    
    # Update changelog
    update_changelog "BRANCH_FIX" "fix: ${slug}" "Created fix branch for iteration" "$branch"
    ;;
  rehydrate)
    check_gh
    echo "🔄 Attempting to rehydrate .riper-pr-url..."
    open_prs=$(gh pr list --state open)
    pr_count=$(echo "$open_prs" | wc -l)
    if [[ $pr_count -eq 1 ]]; then
      pr_url=$(echo "$open_prs" | awk '{print $1}')
      echo "$pr_url" > .riper-pr-url
      echo "✅ Rehydrated: $pr_url"
    else
      echo "❌ Found $pr_count open PRs. Cannot auto-rehydrate."
      echo "$open_prs"
    fi
    ;;
  test)
    echo "Testing GitHub CLI access..."
    if check_gh 2>/dev/null; then
      echo "✅ All systems ready"
    else
      echo "❌ GitHub CLI test failed"
      exit 1
    fi
    ;;
  *)
    echo "Usage: $0 {branch-and-pr|merge|close|branch-fix|rehydrate|test} [args...]"
    echo "  branch-and-pr <slug>     - Create feature branch and PR"
    echo "  merge <pr_url>           - Merge and delete branch"
    echo "  close <pr_url> [comment] - Close PR with comment"
    echo "  branch-fix <slug>        - Create fix branch from main"
    echo "  rehydrate                - Recover .riper-pr-url from open PRs"
    echo "  test                     - Test GitHub CLI authentication"
    echo ""
    echo "Environment variables:"
    echo "  DEBUG=1                  - Enable debug mode (set -x)"
    exit 1
    ;;
esac 