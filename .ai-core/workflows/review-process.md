# Review Process

> How code review works in this project. Applies to all PRs regardless of size.

## Principles
- Review the code, not the person
- Every comment must be actionable or informational (no vague feedback)
- Severity labels and review checklist: see `agents/reviewer.agent.md`
- Default to approval — the goal is to ship, not to block

## PR Requirements (Author)

Before opening a PR, verify:

### Description
Every PR must include:
```markdown
## What
[What this PR changes — 1-3 sentences]

## Why
[The motivation — which requirement, bug, or improvement]

## How to Test
1. [Step 1]
2. [Step 2]
Expected: [What should happen]

## Checklist
- [ ] Tests added/updated
- [ ] No new TypeScript errors (`tsc --noEmit` passes)
- [ ] Lint passes (`npm run lint`)
- [ ] I reviewed my own diff before opening this PR
- [ ] Architecture docs updated (if applicable)
```

### Size Guidelines
| PR Size | Lines changed | Expected review time |
|---------|-------------|----------------------|
| Small | < 100 | < 30 min |
| Medium | 100–400 | 30–90 min |
| Large | > 400 | Split into smaller PRs |

Large PRs are strongly discouraged. If a feature requires > 400 lines, split into:
1. Backend: domain + use cases
2. Backend: controllers + migrations
3. Frontend: components
4. Frontend: pages + integration

## Review Process (Reviewer)

### First Pass (5 min)
- Is the PR description clear?
- Does the scope match what's described?
- Is the PR a reasonable size?

If the description is missing or the PR is too large, request these before reviewing the code.

### Code Review
1. Understand the change context — read the tests first to understand intent
2. Run checklist from `agents/reviewer.agent.md`
3. Leave comments using severity labels (🔴 BLOCKER, 🟡 WARNING, 🟢 SUGGESTION)
4. Leave a summary comment at the top with the overall verdict

### Review SLA
- PRs should receive a first response within 1 business day
- Authors should address all comments within 1 business day of receiving the review

## Merge Rules

| Condition | Action |
|-----------|--------|
| All checks pass + approved | Merge allowed |
| Open BLOCKERs | Must fix before merge |
| Open WARNINGs | Author decides; must reply to each |
| Open SUGGESTIONs | Author may merge; follow-up ticket optional |
| CI failing | Never merge; fix CI first |

## Merge Strategy
- **Preferred**: Squash and merge (clean linear history)
- **When to rebase**: When the branch has meaningful commit history worth preserving
- **Never**: Merge commit for feature branches (reserve for release merges)

## Post-Merge
- Delete the branch after merging
- If issues are discovered after merge: open a new PR, don't force-push to main
- Update related tickets/tasks to reflect the shipped work
