# SFM PRO Enterprise - Review Process

## Purpose

Every sprint begins with a review so the work is grounded in the current architecture, scoped to the correct layer, and protected from accidental regressions. The review stage prevents premature implementation, reduces duplicate logic, and ensures every change is approved before code is written.

## Review Workflow

```text
Project Request
↓
Architecture Review
↓
Gap Analysis
↓
Risk Assessment
↓
Scope Definition
↓
Approval
↓
Implementation
```

| Step | Description |
|---|---|
| Project Request | Define the user need, sprint objective, or target module. |
| Architecture Review | Inspect the existing code structure, dependencies, and module boundaries. |
| Gap Analysis | Compare the current implementation to the requested outcome and identify missing pieces. |
| Risk Assessment | Evaluate regression risk, compatibility risk, and architectural impact. |
| Scope Definition | Lock the allowed files, forbidden files, and expected deliverables. |
| Approval | Wait for explicit permission before changing any file. |
| Implementation | Apply only the approved changes after review is complete. |

## Review Checklist

- [ ] Existing Architecture Reviewed
- [ ] Current Module Understood
- [ ] Similar Module Compared
- [ ] Duplicate Logic Checked
- [ ] Backward Compatibility Verified
- [ ] Files to Modify Identified
- [ ] Files NOT to Modify Identified
- [ ] Risks Documented
- [ ] Dependencies Reviewed
- [ ] Testing Impact Considered

### Checklist Guidance

| Item | What to Confirm |
|---|---|
| Existing Architecture Reviewed | The current structure, flow, and ownership are understood before any change is proposed. |
| Current Module Understood | The exact module behavior, inputs, outputs, and limitations are clear. |
| Similar Module Compared | The target module is compared against a working reference module when available. |
| Duplicate Logic Checked | Existing logic is reused instead of duplicating behavior in another layer. |
| Backward Compatibility Verified | Existing consumers, UI flows, and response shapes remain stable. |
| Files to Modify Identified | Only approved files are listed for change. |
| Files NOT to Modify Identified | Protected files are explicitly excluded from the sprint scope. |
| Risks Documented | Known technical, UX, or compatibility risks are written down clearly. |
| Dependencies Reviewed | Upstream and downstream module dependencies are checked. |
| Testing Impact Considered | Regression and diagnostic checks are identified before implementation starts. |

## Gap Analysis

Gap analysis identifies the difference between the current state and the desired state.

### What to Look For

| Gap Type | Description |
|---|---|
| Missing features | Required behavior is absent in the current implementation. |
| Duplicate logic | The same rule or process exists in multiple layers. |
| Technical debt | Legacy patterns, inconsistent patterns, or outdated flows slow maintainability. |
| Architecture inconsistencies | Module boundaries, ownership, or response shapes do not match the target pattern. |
| Validation gaps | Required checks, sanitization, or normalization are missing. |
| Performance concerns | A design may cause unnecessary work, repeated reads, or inefficient processing. |

### Gap Analysis Approach

1. Review the existing module and the nearest working reference.
2. Identify what the target behavior must do that the current code does not.
3. Separate structural gaps from implementation gaps.
4. Mark any behavior that would conflict with existing consumers.
5. Record only the smallest safe change set that addresses the gap.

## Risk Assessment

Every review must classify risk before implementation.

| Risk Level | Meaning | Example |
|---|---|---|
| Low | The change is localized, backward compatible, and easy to validate. | Updating a single view binding without changing data shape. |
| Medium | The change touches a shared module or a common response path, but compatibility can be preserved. | Standardizing a service response while keeping old fields. |
| High | The change can break downstream consumers, data flow, or storage behavior if handled incorrectly. | Reworking a core engine contract used by multiple modules. |

### Risk Questions

- Will this change alter an existing response shape?
- Will this change affect a shared service or engine?
- Could this change break a dashboard, report, or UI consumer?
- Is there a compatibility bridge available?
- Can the change be validated with diagnostics and regression tests?

## Scope Definition

Scope definition locks the work so the sprint stays focused and safe.

### Files Allowed to Modify

Only the files explicitly approved during the review may be changed.

### Files Forbidden

Any file outside the approved scope is forbidden, including unrelated modules, shared runtime files, and untouched documentation.

### Expected Deliverables

- Gap analysis summary
- Risk assessment
- Approved file list
- Implementation plan
- Regression notes

### Expected Diagnostics

- File-level diagnostics for every modified file
- Syntax and validation checks for touched modules
- Regression impact confirmation for dependent consumers

## Review Output Format

Every review must include the following sections in order.

### Summary

A short explanation of what was reviewed and what the review determined.

### Current Architecture

A concise description of the current module structure and flow.

### Findings

The specific gaps, inconsistencies, or missing behaviors discovered during review.

### Risks

The possible regressions or implementation hazards associated with the change.

### Files to Modify

The approved files that may be changed in the implementation phase.

### Files NOT to Modify

The files that must remain unchanged for this sprint.

### Implementation Plan

The recommended sequence of work for the approved scope.

### Regression Risks

The consumer paths or module behaviors most likely to be affected.

### Recommendation

The final review recommendation, including whether the change should proceed.

### Approval Required

A clear statement that implementation cannot begin until approval is granted.

## Enterprise Rules

- Never generate code during review.
- Never modify files during review.
- Never expand scope.
- One sprint = one objective.
- Wait for approval before implementation.

### Operating Rules

| Rule | Requirement |
|---|---|
| Never generate code during review | Reviews must remain analysis-only. |
| Never modify files during review | File changes are forbidden until approval is granted. |
| Never expand scope | The review must stay within the requested sprint objective. |
| One sprint = one objective | Each sprint should focus on a single outcome or layer. |
| Wait for approval before implementation | No implementation begins until the review is accepted. |

## Markdown Requirements

- Use headings for structure and readability.
- Use tables for comparison, scope, and risk detail.
- Use bullet lists for checklists and rules.
- Use code blocks for workflow diagrams or example formats.
- Keep the document professional, concise, and easy to follow.

### Example Document Blocks

```text
Review
↓
Gap Analysis
↓
Approval
↓
Implementation
```

```json
{
	"summary": "Review complete",
	"recommendation": "Proceed after approval"
}
```
