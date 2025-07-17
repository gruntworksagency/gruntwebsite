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
    pr_url="$1"
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
    echo "  merge <pr_url>           - Merge and delete branch"
    echo "  close <pr_url> [comment] - Close PR with comment"
    echo "  branch-fix <slug>        - Create fix branch from main"
    echo "  readme-append <pr_url>   - Update README with feature description"
    echo "  test                     - Test GitHub CLI authentication"
    exit 1
    ;;
esac
