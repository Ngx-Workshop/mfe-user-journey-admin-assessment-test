# Architecture — administrator assessment authoring

Updated 2026-10-07 for [004 MVVM refactor](../specs/004-mvvm-refactor/spec.md).

Angular 21.1 standalone, zoneless remote for catalog filtering and a three-step
assessment-definition wizard. Signals expose synchronous view state; RxJS controls
asynchronous requests and lifetimes. No additional state framework is used.

## Ownership and source map

| Layer | Source | Responsibility |
| --- | --- | --- |
| Model | `models/assessment-test.ts` | DTO-derived subject and explicit create/update payload types; no forms, state or HTTP dependencies |
| Data access | `services/assessment-tests-api.service.ts` | Stateless, cold HTTP observables; sole HttpClient consumer |
| Singleton state | `state/assessment-catalog.store.ts` | Server catalog, pending/error state, refresh/delete orchestration and success-only row removal |
| Singleton state | `state/assessment-editor.store.ts` | Current server definition/ID/version, load/save orchestration, pending/error state and mutation guards |
| Local view model | `assessment-tests/catalog/assessment-catalog.view-model.ts` | Search/subject/level/sort, ten-row pagination, clamping and derived catalog rows |
| Local view model | `assessment-tests/wizard/assessment-wizard.view-model.ts` | Unsaved typed form, steps, validation targets and ten-question review pages |
| Local view model | `assessment-tests/question-workspace/question-workspace.view-model.ts` | Selection, outline filters/pages, structural edits and undo with stable FormGroup identity |
| Form factory | `services/assessment-test-form.service.ts` | Stateless typed form creation, validators, structural operations and explicit raw-value payload mapping |
| Journey orchestration | `assessment-tests/catalog/assessment-test-list.component.ts`, `assessment-tests/wizard/assessment-test-wizard.component.ts` | Store commands/subscriptions, route/navigation, confirmation, success feedback and unsaved guards |
| Nested orchestration | `assessment-tests/question-workspace/question-workspace.component.ts` | Connects local workspace view model to outline, fields and toolbar; handles DOM focus and choice intents |
| Presentation | `assessment-catalog-view`, catalog filters/rows/empty state; wizard heading/controls/basics/review; question outline/actions/fields | Typed inputs and intent outputs; no data access, singleton-store injection, navigation or snackbars |

All paths above are relative to `src/app`. Every component uses OnPush and owns
inline HTML/SCSS. Owned classes use component-specific BEM blocks/elements/modifiers.
The outline and workspace are modest exceptions to the approximate 230-line target:
keeping their cohesive accessible markup and responsive styles together avoids
fragmenting a single responsibility. Do not externalize their HTML/SCSS to reduce size.

## Directory organization

`src/app/assessment-tests` groups components and their local view models into
`catalog/`, `wizard/` and `question-workspace/`. Shared model, service and singleton
store boundaries remain under `src/app/models`, `src/app/services` and `src/app/state`.

Specs live outside application source in a root `testing/` directory mirroring
`src/`: catalog/workspace suites are under `testing/app/assessment-tests`, service
suites under `testing/app/services`, and store suites under `testing/app/state`.
The cross-journey authoring suite remains at the assessment feature root.
There are no spec files under `src/`. The test target explicitly discovers the
external specs; the production TypeScript configuration excludes `testing/`.

## Data flow and lifetime

Components never inject the HTTP adapter. Stores expose readonly computed signals
backed by private writable state. Store operation observables are lazy: subscribing
starts a request, and finalize clears pending state on completion, failure or
cancellation. A failed operation completes without a success emission, preserving
catalog rows or unsaved edits. Guards in the stores suppress concurrent mutations;
components disable conflicting interactions as a user experience measure.

Stores are root-provided; one mounted editor journey owns the current editor
session. Forms, step state, filters, outline selection and undo are instantiated
locally and are not cached in singleton state. Catalog state can survive navigation;
returning to the catalog refreshes it. The wizard merges distinct route IDs and
explicit retry intent, then switchMaps to the editor store: obsolete loads are
unsubscribed before a new session starts. Store subscriptions are terminated with
an explicitly injected DestroyRef when the orchestrator is destroyed. The workspace
bridges merged form value/status streams into computed outline snapshots with an
effect-owned subscription, cleaned up when the form changes or the workspace is
destroyed. This bridge stays in the shared Angular core context: interop helpers
resolved a duplicate core instance in hosted testing (NG0203/NG0201).

The wizard guards unsaved navigation and browser reload, prevents pending saves
from leaving, validates skipped steps, and targets the first invalid question.
The heading receives primitive name/dirty inputs so changes in a separate OnPush
form child update it. Review receives raw display values, not mutable form controls.
Review maps only the current ten controls; the outline shows twelve questions and
only the selected question mounts a form. Duplication uses independent controls;
movement and one-level removal undo preserve identity and answer associations.

## Shell and compatibility

`app.ts` remains the federation route shell with header/catalog navigation.
`bootstrap.ts` keeps its RouterOutlet-only standalone root. Default `App`, exported
`Routes`, `remoteEntry.js`, exposures and shared dependency versions are preserved.
The empty child route is the catalog; `tests/new` and `tests/:id` mount the guarded
wizard. Learner attempts and scoring remain service-owned. The wizard saves mutable
definitions directly; no publication lifecycle is implied.

Published contract package: `@tmdjr/service-nestjs-assessment-test-contracts` 0.0.18
(as installed in this checkout). Payloads remain explicitly mapped. PATCH goes to
the collection URL and includes route `_id` and the loaded `__v`. DELETE uses `/:id`.
Production uses `/api/assessment-test`; development replacement uses
`http://localhost:3005/assessment-test`. Do not publish development assets. The shell
supplies theme and authentication; hosted rendering remains the visual integration
boundary. Pass DestroyRef explicitly to takeUntilDestroyed for federation compatibility.

The server rejects edits/deletions after learner attempts, duplicate subject/level
and stale versions. Errors retain the draft. This refactor requires no backend,
gateway, dependency, payload, federation or data-migration changes.
