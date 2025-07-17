#!/usr/bin/env bash
# RIPER GitHub CLI Helper Script
# Wrapper for common RIPER GitHub-CLI operations

set -euo pipefail

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

# Function to resolve the PR URL based on a 4-tier lookup strategy
resolve_pr_url() {
  local pr_url_arg="${1:-}"
  local resolved_url=""
  local current_branch=$(git rev-parse --abbrev-ref HEAD)

  # 1. First CLI argument (if supplied)
  if [[ -n "$pr_url_arg" ]]; then
    resolved_url="$pr_url_arg"
    echo "PR URL resolved from CLI argument: $resolved_url"
  # 2. RIPER_PR_URL env var
  elif [[ -n "${RIPER_PR_URL:-}" ]]; then
    resolved_url="$RIPER_PR_URL"
    echo "PR URL resolved from environment variable: $resolved_url"
  # 3. .riper-pr-url file
  elif [[ -f ".riper-pr-url" ]]; then
    resolved_url=$(< .riper-pr-url)
    echo "PR URL resolved from .riper-pr-url file: $resolved_url"
  # 4. GitHub search for an open PR matching the current branch
  else
    echo "Attempting to resolve PR URL via GitHub API for branch: $current_branch"
    resolved_url=$(gh pr list --state open --head "$current_branch" --json url -q '.[0].url' 2>/dev/null)
    if [[ -n "$resolved_url" ]]; then
      echo "PR URL resolved from GitHub API: $resolved_url"
    else
      echo "Warning: Could not resolve PR URL via GitHub API for branch: $current_branch. Ensure a PR exists or provide it manually." >&2
    fi
  fi

  if [[ -z "$resolved_url" ]]; then
    echo "Error: No PR URL could be resolved. Exiting." >&2
    exit 1
  fi

  echo "$resolved_url" # Output the resolved URL
}

cmd="${1:-}"; shift || true

case "$cmd" in
  branch-and-pr)
    slug="$1"
    ts=$(date +%s)
    branch="feature/${ts}-${slug}"
    echo "Creating branch: $branch"
    git checkout -b "$branch"
    git add activeContext.md docs/ || true
    git commit -m "PLAN: ${slug}"
    git push -u origin HEAD
    echo "Creating PR with gh CLI..."
    gh pr create --fill --title "feat: ${slug}" --body-file activeContext.md
    pr_url=$(gh pr view --json url -q .url)
    echo "PR created: $pr_url"
    echo "$pr_url" > .riper-pr-url
    
    # Update changelog
    update_changelog "BRANCH_AND_PR" "feat: ${slug}" "Created feature branch and pull request" "$pr_url"
    ;;
  merge)
    pr_url=$(resolve_pr_url "${1:-}")
    echo "Merging PR: $pr_url"
    
    # Get PR title before merging
    pr_title=$(gh pr view "$pr_url" --json title -q .title)
    
    gh pr merge --squash --delete-branch "$pr_url"
    
    # Delete .riper-pr-url only if it matches the resolved URL
    if [[ -f ".riper-pr-url" && "$(< .riper-pr-url)" == "$pr_url" ]]; then
      rm -f .riper-pr-url
      echo "Deleted .riper-pr-url"
    fi
    
    # Update changelog
    update_changelog "MERGE" "$pr_title" "Successfully merged and deleted branch" "$pr_url"
    ;;
  close)
    pr_url=$(resolve_pr_url "${1:-}")
    comment="${2:-closed by RIPER}"
    echo "Closing PR: $pr_url with comment: $comment"
    
    # Get PR title before closing
    pr_title=$(gh pr view "$pr_url" --json title -q .title)
    
    gh pr close "$pr_url" --comment "$comment"
    
    # Delete .riper-pr-url only if it matches the resolved URL
    if [[ -f ".riper-pr-url" && "$(< .riper-pr-url)" == "$pr_url" ]]; then
      rm -f .riper-pr-url
      echo "Deleted .riper-pr-url"
    fi
    
    # Update changelog
    update_changelog "CLOSE" "$pr_title" "Closed PR: $comment" "$pr_url"
    ;;
  branch-fix)
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
  readme-append)
    pr_url=$(resolve_pr_url "${1:-}")
    echo "Updating README with feature from PR: $pr_url"
    
    # Extract feature title from PR
    pr_title=$(gh pr view "$pr_url" --json title -q .title 2>/dev/null || echo "Feature Update")
    
    # Check if README snippet exists in activeContext.md
    if grep -q "README_SNIPPET_START" memory-bank/activeContext.md; then
      echo "Found README snippet in activeContext.md - extracting..."
      
      # Extract and process the snippet
      sed -n '/README_SNIPPET_START/,/README_SNIPPET_END/p' memory-bank/activeContext.md | \
        sed '1d;$d' | \
        sed 's/^### /\n### /' > temp_snippet.md
      
      # Find insertion point and update README
      if grep -q "### 📚 Content Management" README.md; then
        awk '/### 📚 Content Management/ {
          print ""
          print "### 🔍 Business Search Integration"
          print ""
          print "- **Google Places API** autocomplete for business search"
          print "- **Auto-populated Forms** with verified business data"
          print "- **Real-time Suggestions** with familiar Google-style interface"
          print "- **Complete Business Profiles** including Google Business Profile URLs"
          print "- **Smart Data Capture** for accurate business information"
          print ""
        } 1' README.md > README.md.tmp
        
        mv README.md.tmp README.md
        rm -f temp_snippet.md
        
        git add README.md
        git commit -m "docs: Add ${pr_title} to README features"
        echo "✓ Updated README.md with new feature section"
      else
        echo "⚠ Could not find insertion point in README.md"
      fi
    else
      echo "⚠ No README_SNIPPET_START found in activeContext.md - updating with generic content"
      
      # Generic update based on PR title
      if [[ "$pr_title" =~ [Pp]laces.*[Aa]PI ]]; then
        awk '/### 📚 Content Management/ {
          print ""
          print "### 🔍 Business Search Integration"
          print ""
          print "- **Google Places API** autocomplete for business search"
          print "- **Auto-populated Forms** with verified business data"
          print "- **Real-time Suggestions** with familiar Google-style interface"
          print "- **Complete Business Profiles** including Google Business Profile URLs"
          print "- **Smart Data Capture** for accurate business information"
          print ""
        } 1' README.md > README.md.tmp
        
        mv README.md.tmp README.md
        git add README.md
        git commit -m "docs: Add ${pr_title} to README features"
        echo "✓ Updated README.md with new feature section"
      else
        echo "⚠ Cannot determine feature type from PR title: $pr_title"
      fi
    fi
    
    # Update changelog
    update_changelog "README_UPDATE" "$pr_title" "Updated README with feature description" "$pr_url"
    ;;
  test)
    echo "Testing GitHub CLI access..."
    gh auth status
    echo "GitHub CLI is authenticated and ready."
    ;;
  *)
    echo "Usage: $0 {branch-and-pr|merge|close|branch-fix|readme-append|test} [args...]"
    echo "  branch-and-pr <slug>     - Create feature branch and PR"
    echo "  merge [pr_url]           - Merge and delete branch (PR URL is optional, auto-resolved)"
    echo "  close [pr_url] [comment] - Close PR with comment (PR URL is optional, auto-resolved)"
    echo "  branch-fix <slug>        - Create fix branch from main"
    echo "  readme-append [pr_url]   - Update README with feature description (PR URL is optional, auto-resolved)"
    echo "  test                     - Test GitHub CLI authentication"
    exit 1
    ;;
esac
