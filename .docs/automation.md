# RIPER GitHub Automation

A hardened Bash helper script that streamlines feature-branch creation, PR creation, and automated merges for RIPER workflows.

## Features

- **Pre-flight Authentication Checks**: Verifies GitHub CLI is authenticated and has proper repository access
- **Path Resolution**: Correctly handles `memory-bank/activeContext.md` and other project paths
- **Debug Mode**: Enable verbose output with `DEBUG=1` environment variable
- **Graceful Error Handling**: Informative error messages instead of silent failures
- **PR Recovery**: Rehydrate lost `.riper-pr-url` references from open PRs
- **Changelog Integration**: Automatic updates to `memory-bank/changelog.md`

## Usage

### Basic Commands

```bash
# Test GitHub CLI authentication
scripts/riper-gh.sh test

# Create feature branch and PR
scripts/riper-gh.sh branch-and-pr "email-infrastructure"

# Merge a PR (squash merge with branch deletion)
scripts/riper-gh.sh merge "https://github.com/owner/repo/pull/123"

# Close a PR with comment
scripts/riper-gh.sh close "https://github.com/owner/repo/pull/123" "needs rework"

# Create fix branch from main
scripts/riper-gh.sh branch-fix "auth-error-handling"

# Recover PR URL if .riper-pr-url is lost
scripts/riper-gh.sh rehydrate
```

### Debug Mode

Enable verbose output to troubleshoot issues:

```bash
DEBUG=1 scripts/riper-gh.sh branch-and-pr "my-feature"
```

## Prerequisites

1. **GitHub CLI**: Install and authenticate

   ```bash
   # Install GitHub CLI
   sudo apt install gh  # or brew install gh

   # Authenticate with GitHub
   gh auth login
   ```

2. **Required Scopes**: Your GitHub token needs:
   - `repo` (full repository access)
   - `workflow` (GitHub Actions access)
   - `write:discussion` (PR comments)

3. **Repository Structure**: Script expects:
   - `memory-bank/activeContext.md` (active context file)
   - `.docs/` or `docs/` directory (documentation)

## Troubleshooting

### Authentication Issues

**Error**: `❌ GitHub CLI not authenticated`

```bash
# Check current auth status
gh auth status

# Re-authenticate if needed
gh auth login --scopes repo,workflow,write:discussion
```

**Error**: `❌ Not inside a GitHub repository`

- Ensure you're in the correct project directory
- Verify remote origin: `git remote -v`
- Check repository access: `gh repo view`

### Permission Issues

**Error**: `403 Forbidden` during PR operations

- Token may lack required scopes
- Re-authenticate with broader permissions:
  ```bash
  gh auth refresh --scopes repo,workflow,write:discussion
  ```

### File Path Issues

**Error**: `pathspec 'activeContext.md' did not match any files`

- Script now uses `memory-bank/activeContext.md` automatically
- Update your local copy if using an older version

### Network Issues

**Error**: `Failed to connect to github.com`

- Check internet connectivity
- Verify GitHub status: https://status.github.com
- Try again after a brief delay

### Multiple Open PRs

**Error**: Rehydrate finds multiple open PRs

```bash
# List open PRs to identify the correct one
gh pr list --state open

# Manually create .riper-pr-url
echo "https://github.com/owner/repo/pull/123" > .riper-pr-url
```

## Integration with Husky

The script includes a `test` command suitable for pre-commit hooks:

```bash
# Add to .husky/pre-commit
scripts/riper-gh.sh test
```

This ensures contributors have proper GitHub CLI setup before committing.

## Common Workflows

### Standard Feature Development

1. `scripts/riper-gh.sh branch-and-pr "feature-name"`
2. Make changes and commit
3. Push updates to the created branch
4. `scripts/riper-gh.sh merge <pr-url>` after review

### Fix Iteration

1. `scripts/riper-gh.sh branch-fix "fix-name"`
2. Implement fixes
3. Create PR manually or use `branch-and-pr`
4. Merge when ready

### Recovery Scenarios

- Lost PR URL: `scripts/riper-gh.sh rehydrate`
- Failed authentication: `scripts/riper-gh.sh test`
- Debug issues: `DEBUG=1 scripts/riper-gh.sh <command>`

## Environment Variables

- `DEBUG`: Enable verbose output (`DEBUG=1`)
- Standard Git/GitHub environment variables are respected

## Changelog

All script operations are automatically logged to `memory-bank/changelog.md` with timestamps and details.
