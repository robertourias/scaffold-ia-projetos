# Release Process

> Steps to deploy changes to production safely. Follow this process for every release.

## Release Types

| Type | Trigger | Examples |
|------|---------|---------|
| Patch | Bug fix, hotfix | Fix broken validation, fix UI glitch |
| Minor | New feature, improvement | New page, new API endpoint |
| Major | Breaking change | API v2, redesign, auth overhaul |

## Standard Release Process

### 1. Pre-Release Checklist
- [ ] All PRs intended for this release are merged to `main`
- [ ] CI pipeline is green on `main`
- [ ] No open BLOCKER issues from review
- [ ] Migrations have been tested locally and on staging
- [ ] Environment variables for new features are configured in all environments
- [ ] Feature flags are set correctly (if applicable)

### 2. Staging Deploy & Verification
```bash
# Deploy to staging (adjust command for your CI/CD setup)
git push origin main  # triggers staging deploy via CI

# Or manually:
npm run deploy:staging
```

**Verify on staging:**
- [ ] New feature works end-to-end
- [ ] Existing critical flows still work (smoke test)
- [ ] No errors in logs (check Sentry or equivalent)
- [ ] DB migrations ran successfully
- [ ] Performance metrics are normal

### 3. Production Deploy
```bash
npm run deploy:production
# or tag a release:
git tag v[X.Y.Z]
git push origin v[X.Y.Z]
```

**Immediately after deploy:**
- [ ] Verify the feature in production (critical path only)
- [ ] Monitor error rates for 15 minutes
- [ ] Monitor API response times for 15 minutes
- [ ] Check database metrics (query times, connection pool)

### 4. Post-Deploy
- [ ] Mover `[Unreleased]` para versão com data no `CHANGELOG.md` (ver `workflows/documentation.md`)
- [ ] Criar ou atualizar `docs/features/<feature>.md` para cada feature entregue
- [ ] Notify stakeholders (Slack, email, etc.)
- [ ] Close related tasks/tickets
- [ ] Celebrate 🎉

## Hotfix Process

For urgent production bugs:

```bash
git checkout -b hotfix/describe-the-issue main
# make the fix
git push origin hotfix/describe-the-issue
# open PR directly to main
# review and merge immediately
# deploy following steps 2-4 above
```

**Hotfix criteria**: Only use for production-breaking issues. Everything else waits for the normal release cycle.

## Database Migrations

Migrations require extra care — they cannot be easily rolled back.

### Before running migrations on production:
- [ ] Migration tested on staging with production-like data volume
- [ ] Migration is backward-compatible (old code can run with new schema)
- [ ] If breaking change: deploy in two phases
  1. Phase 1: Add new column/table (keep old)
  2. Deploy new code
  3. Phase 2: Remove old column/table after confirming stability

### Dangerous operations — require explicit approval:
- `DROP TABLE` or `DROP COLUMN`
- `NOT NULL` constraint on existing table without default
- Renaming tables or columns referenced by app code
- Index changes on tables > 1M rows (may lock)

## Rollback Plan

If a production issue is detected after deploy:

1. **Assess**: Is the issue caused by code or migration?
2. **Code rollback**: Revert to previous deployment version in your hosting platform
3. **Migration rollback**: Only if migration was backward-compatible and has a down migration
4. **Communicate**: Notify team immediately; update status page if user-facing

```bash
# Rollback code deploy (example for common platforms)
# Vercel: vercel rollback
# Railway: railway rollback
# AWS/ECS: update service to previous task definition
```

## Changelog Format

```markdown
## [1.2.0] - 2024-01-15

### Added
- User profile photos with automatic resizing
- Email notification preferences

### Fixed
- Order total calculation was wrong for discounts > 100%
- Password reset link expired too early (now 24h)

### Changed
- Dashboard loads 3x faster (added pagination)
```
