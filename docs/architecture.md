# Architecture — administrator assessment authoring

Updated for [002 scalable wizard](../specs/002-question-workspace/spec.md).

Angular standalone, zoneless remote for catalog filtering and a three-step definition
wizard. Learner attempts and scoring remain service-owned. No publication lifecycle
is implied: the wizard saves definitions directly.

## Source and behavior

- `app.ts` is the federation route shell with the shared header, bounded body wrapper,
  stable dashboard/catalog navigation. The catalog owns its create action.
- `bootstrap.ts` uses a separate RouterOutlet-only standalone root to avoid nesting
  the shell twice. Default App export, Routes export and federation identity remain.
- `app.routes.ts`: catalog at empty path; `tests/new` and `tests/:id` use the wizard
  with an unsaved-change guard. Navigation remains inside the mounted remote.
- `assessment-test-form.service.ts`: typed controls and direct raw-value mapping.
  Requires trimmed nonblank text, integer level, distinct choices and answer membership.
  Structural edits mark dirty; at least one question and two choices remain.
- Catalog components distinguish loading/error/empty/no matches, wire refresh and
  show compact rows with direct Edit and a secondary Delete menu. Failed deletion retains rows.
  Search/subject/maximum-level/sort controls reset ten-row pagination; refresh/deletion
  clamps the current page. Native details preview at most three question prompts per row.
  Maximum-level options derive from catalog data. Dates use the existing lastUpdated field.
- Wizard observes route parameters, cancels obsolete loads, guards pending saves,
  retains failed edits, offers load retry, validates skipped steps and previews feedback.
  Pending/failed loading disables the editor; navigation/reload protects unsaved work.
- `assessment-tests-api.service.ts` owns requests; `api-error.ts` translates HTTP errors.

## API and integration

Published response types remain `@tmdjr/service-nestjs-assessment-test-contracts` 0.0.15.
Input payloads are explicitly mapped and compatible with the regenerated producer
DTOs. PATCH includes `_id` and `__v` from GET. DELETE uses `/:id`, avoiding a raw string
body. The producer must be upgraded before the consumer uses these changes.

Production `environment.ts` uses `/api/assessment-test`; the development replacement
uses `http://localhost:3005/assessment-test`. `dev:bundle` now builds development assets.
Do not publish a development bundle. Production builds retain the gateway path and
contain no local API address. Host authentication is independent of the isolated local
service identity.

Pass the injected DestroyRef explicitly to `takeUntilDestroyed`; hosted testing exposed
an injection-context mismatch when relying on its implicit injection through federation.
The shell supplies the theme and authentication. Standalone rendering is useful for
functional checks; hosted rendering is the visual integration boundary.

Service policy: tests referenced by learner attempts cannot be edited/deleted;
subject/level duplicates and stale versions return conflicts. The editor communicates
this restriction and preserves form data on a rejected save. Learner taking/scoring
and production data migration are outside this remote's scope.

## Large assessments

`question-workspace.component` owns the question outline and focused editor; the
parent retains HTTP, route and save ownership. The outline searches the whole array
and shows 12 entries per page, with ready/incomplete status and filtering. Exactly
one question form is mounted. Stable FormGroup identity preserves selection and
answer/feedback associations during moves. Reordering supports adjacent movement
and direct position entry. Duplicates get independent controls. A single removed
question can be restored until the workspace is left or another question is removed.

The wizard sends review validation to the first invalid question and uses 10 native
expandable review summaries per page. Edit links return to the underlying control.
Review tracks absolute positions, avoiding re-creation of details on every change
detection. Pending-save, errors, unsaved navigation and the API payload are unchanged.
Templates and theme-aware styles now live beside their component source files.
