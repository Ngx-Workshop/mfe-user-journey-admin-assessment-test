# Admin assessment readiness review and handoff

Baseline: `acf3822`, reviewed 2026-09-30. Scope: codebase review and Markdown workflow
migration. Findings below are source observations, not executed production failures.

## Findings for the next implementation specification

| Finding | Evidence | Expected follow-up |
| --- | --- | --- |
| Save mapper reads controls from raw data | `toPayload` calls getRawValue, casts each question to TestQuestionForm, then toQuestionDto uses question.value.trim and choices.controls | Map the raw-value shape or pass actual controls; test multi-question create/edit payloads and verify requests are sent |
| Failed delete still reports success | catchError returns of(undefined), then success subscription removes row and shows Test deleted | Keep row and show failure; only apply deletion on successful response |
| Answer can become stale | Answer stores a choice string; editing/removing a choice does not reconcile it; only required validator exists | Agree and test answer membership/identity, choice uniqueness and trimmed values |
| Limited validation | Required permits whitespace before trimming; level has min but not integer validation; step buttons validate only the current step | Define invariants and align form/service validation; test direct jumps and invalid forms |
| Wizard error recovery absent | Fetch/create/update subscribe only to success; no explicit error state, retry or not-found handling | Keep entered data and expose recoverable errors; prevent interactions that conflict with pending fetch/save |
| Edit route changes are not reactive | effect reads route.snapshot with no signal dependency | Observe route parameters and test navigation between IDs on a reused component |
| Navigation/state gaps | No unsaved guard; previousNavigation-derived shell Back; list/wizard use relative route traversal | Verify all routes under actual host mount and protect unsaved work |
| Refresh does nothing | Accordion refresh button has no click/output wiring; matTooltip is used without tooltip module import | Wire reload and accessible feedback |
| Error and empty states conflate | List failure substitutes []; empty copy always suggests creating a first test | Distinguish failure, empty catalog and no filter matches |
| Accessibility/preview gaps | Several icon-only actions have no accessible name; review omits feedback; header actions live inside expansion header | Define keyboard/focus behavior, action propagation and complete author review |
| Lifecycle copy overstates behavior | Wizard says publish; API offers direct create/update/delete only | Clarify save wording or explicitly specify producer lifecycle changes |
| No regression suite | No source spec files | Establish forms, request, failure-state and routing tests before claiming readiness |

The form-mapping issue occurs before saving is set and before POST/PATCH is called;
a successful build alone would not catch this path. These defects were documented,
not repaired, in this migration.

## Contract and ownership decisions

The admin client consumes package 0.0.15; the companion service's local manifest
version is not proof of what is deployed/published. Before changing authoring, verify
actual exported DTOs and runtime acceptance. The service review found weak definition
input validation, incomplete explicit admin-role declarations, full answer-key reads
and mutable definitions used for attempt scoring. Define effects of editing/deleting
definitions with existing attempts, and keep learner-redacted payloads separate from
admin data. These service issues require their owner's implementation work.

Keep the current native CRUD semantics (PATCH at collection path with _id, DELETE
with ID string body) until a coordinated change is specified. Confirm host base URL,
mount, remote identity and auth behavior rather than assuming registry configuration.
No draft, archive, publication/version or learner retry policy is approved by this
source review.

## Delivered documentation and verification

Added AGENTS.md, constitution, reusable workflow/four templates, architecture,
development, seed-adoption status, this review and feature index; updated README to
reflect actual source and limitations. These files stand alone in this repository.

Checks: local documentation links resolve; generic workflow/templates match the
seed; whitespace checks pass; all changed/added files are Markdown. Template links
to spec.md/plan.md/tasks.md/handoff.md intentionally target future feature folders.
No runtime tests/builds, live integration, contract changes, commit/push or deployment
were performed.

Migration is complete. Next: choose the authoring behavior to repair or extend and
create an agreed feature's spec/plan/tasks/handoff. No implementation feature is
invented or marked complete by this documentation migration.
