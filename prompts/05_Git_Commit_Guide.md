# SFM PRO Enterprise - Git Commit Guide

## Purpose

Consistent Git practices are important because they preserve project history, make collaboration predictable, and create reliable release points. A clear Git workflow also makes it easier to review changes, trace regressions, and tag important milestones for future versions.

---

## Git Workflow

```text
Development
↓
Review
↓
Implementation
↓
Testing
↓
Architecture Approval
↓
Git Commit
↓
Git Push
↓
Release (if applicable)
```

| Stage | Description |
|---|---|
| Development | The sprint objective is analyzed and prepared for implementation. |
| Review | The requested work is reviewed for scope, risks, and architecture impact. |
| Implementation | Approved code changes are made within the agreed scope. |
| Testing | Diagnostics and regression checks are performed to confirm the change is safe. |
| Architecture Approval | The implementation is verified against the target architecture and standards. |
| Git Commit | The approved and validated change set is committed to version control. |
| Git Push | Local commits are pushed to the remote repository when applicable. |
| Release (if applicable) | Stable milestones may be tagged and released after approval. |

---

## Daily Git Workflow

Recommended workflow:

1. Check repository status
2. Pull latest changes (if using a remote repository)
3. Implement approved work
4. Run diagnostics
5. Execute regression testing
6. Review changed files
7. Commit changes
8. Push changes (if applicable)

### Workflow Notes

| Step | Purpose |
|---|---|
| Check repository status | Confirm the working tree before making changes. |
| Pull latest changes | Keep local work aligned with the latest remote state. |
| Implement approved work | Make only the changes that were reviewed and approved. |
| Run diagnostics | Catch syntax, import, export, or build issues early. |
| Execute regression testing | Confirm existing features still work after the change. |
| Review changed files | Ensure only the intended files were modified. |
| Commit changes | Record the approved work in version control. |
| Push changes | Share the commit to the remote repository when required. |

---

## Git Commands

### Check status

```bash
git status
```

### Stage changes

```bash
git add .
```

### Commit

```bash
git commit -m "Sprint X.X: Short description"
```

### Push

```bash
git push
```

### View history

```bash
git log --oneline
```

### Create tag

```bash
git tag -a v0.5.0 -m "Complete Income Module"
git push origin v0.5.0
```

### Command Summary

| Command | Use |
|---|---|
| `git status` | Inspect the current repository state. |
| `git add .` | Stage the intended changes for commit. |
| `git commit -m "Sprint X.X: Short description"` | Record the sprint work with a clear message. |
| `git push` | Send committed changes to the remote repository. |
| `git log --oneline` | Review commit history in a compact format. |
| Tag commands | Mark important milestones and release points. |

---

## Commit Message Convention

Use short, descriptive messages that identify the sprint and the main change.

Examples:

- Sprint 2.5A: Enterprise validation for Income Engine
- Sprint 2.5B: Standardize Income Service responses
- Sprint 2.5C: Refactor Income Controller

### Guidelines

| Rule | Requirement |
|---|---|
| Keep messages short | Avoid long, unreadable commit text. |
| Keep messages descriptive | State what changed, not just that something changed. |
| Mention the sprint | Make sprint history easy to trace. |
| Avoid vague wording | Do not use commit messages that hide the actual intent. |

---

## Branch Strategy

| Branch | Purpose |
|---|---|
| main | Stable, approved release-ready code. |
| develop | Integration branch for approved sprint work. |
| feature/* | Temporary branches for focused feature or sprint work. |
| hotfix/* | Urgent fixes for production or release-blocking issues. |

### Branch Behavior

- `main` should always remain stable and ready for release tags.
- `develop` can collect approved sprint work before promotion to `main`.
- `feature/*` branches should stay narrow and scoped to one objective.
- `hotfix/*` branches should be used only for urgent corrections.

---

## Release Versioning

The project uses semantic versioning in the format `Major.Minor.Patch`.

Examples:

- v0.5.0
- v0.6.0
- v1.0.0

### Version Meaning

| Version Type | Meaning |
|---|---|
| Major | Large architectural or platform-level change, or a milestone release that may introduce broad compatibility impact. |
| Minor | New feature set, completed module, or meaningful sprint milestone that remains backward compatible. |
| Patch | Small correction, bug fix, or refinement that does not change the larger feature set. |

### Versioning Rules

- Use `Major.Minor.Patch` consistently.
- Tag important milestones with a clear release message.
- Increment only the part of the version that matches the scale of the change.

---

## Pre-Commit Checklist

- [ ] Review Approved
- [ ] Scope Respected
- [ ] Diagnostics Passed
- [ ] Regression Testing Passed
- [ ] Console Clean
- [ ] Documentation Updated
- [ ] Changelog Updated
- [ ] No Unrelated Files Modified

### Pre-Commit Guidance

| Check | What to Confirm |
|---|---|
| Review Approved | The change was approved before implementation. |
| Scope Respected | Only the agreed files and behaviors were changed. |
| Diagnostics Passed | Syntax, import, export, and build checks are clean. |
| Regression Testing Passed | Existing features still work after the change. |
| Console Clean | No unexpected errors or warnings remain. |
| Documentation Updated | User-facing or technical docs were updated if needed. |
| Changelog Updated | Relevant history was recorded for future reference. |
| No Unrelated Files Modified | The commit contains only approved changes. |

---

## Release Checklist

Before creating a release:

- [ ] All Tests Passed
- [ ] Documentation Updated
- [ ] Module Status Updated
- [ ] Changelog Updated
- [ ] Version Tag Created
- [ ] Backup Completed

### Release Notes

| Item | Why It Matters |
|---|---|
| All Tests Passed | Confirms the release is stable. |
| Documentation Updated | Ensures the project records match the implementation. |
| Module Status Updated | Reflects the latest project state. |
| Changelog Updated | Provides a clear history of the release. |
| Version Tag Created | Marks the release point in Git history. |
| Backup Completed | Protects the release state and supporting data. |

---

## Enterprise Rules

- Never commit failing code.
- Never commit unrelated changes.
- Commit only approved scope.
- Keep commit messages clear.
- Tag important milestones.

### Rules Table

| Rule | Requirement |
|---|---|
| Never commit failing code | Commit only after diagnostics and testing pass. |
| Never commit unrelated changes | Keep each commit tightly scoped. |
| Commit only approved scope | Do not include unreviewed work. |
| Keep commit messages clear | Use precise and useful commit text. |
| Tag important milestones | Mark major sprint or release points for traceability. |

---

## Markdown Requirements

- Use headings.
- Use tables where appropriate.
- Use bullet lists.
- Use checklists.
- Use code blocks for commands and examples.

### Example Blocks

```text
Development
↓
Review
↓
Implementation
↓
Testing
↓
Git Commit
```

```bash
git status
git add .
git commit -m "Sprint 2.5A: Enterprise validation for Income Engine"
```
