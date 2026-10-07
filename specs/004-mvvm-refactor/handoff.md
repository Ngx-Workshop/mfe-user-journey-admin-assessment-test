# Handoff: Assessment authoring MVVM refactor

Status: Complete; locally and hosted verified
Updated: 2026-10-07
Spec: [spec.md](spec.md) · Plan: [plan.md](plan.md) · Tasks: [tasks.md](tasks.md)

## Delivered

The HTTP adapter is stateless and depends on independent model payload types.
Root catalog/editor stores now own server data, identity/version, pending state,
error translation and request orchestration. State is exposed through readonly
computed signals; request observables remain lazy and mutations are guarded.
Journey components own subscriptions, navigation, confirmations and success feedback.
Route/retry loading uses switchMap and explicit DestroyRef cleanup.

Catalog filtering/pagination, wizard draft/steps/review and question selection/
structure are local view models. New presentation components cover catalog view,
wizard heading/controls/basics/review and question outline/actions/fields. All 16
components (including standalone bootstrap) use OnPush and inline templates/styles;
owned classes follow BEM. The former four external HTML/SCSS files are removed.
The catalog orchestrator fell from 426 to 68 lines and the wizard is approximately
200 lines including its inline UI. Outline/workspace retain cohesive accessible
markup and responsive styles at 258/261 lines, modest exceptions to the soft target.

Validation, errors/retry, unsaved protection, API mapping/version, selection identity,
duplication, reordering, removal/undo and bounded rendering remain covered. Review
maps only the current ten question controls. The heading receives primitive inputs
so changes inside a separate OnPush form child remain visible. The outline's sticky
position is owned by its new host to preserve scrolling after extraction. New form
loads reset transient move/announcement state as well as selection/filters/undo.

## Verification

| Acceptance/check | Actual method | Result |
| --- | --- | --- |
| AC-001/002/003 | `npm test -- --watch=false --browsers=ChromeHeadless` | PASS: 33 tests (original 22 plus 11 boundary/rendering regressions) |
| AC-004 build | `npm run build -- --output-path /tmp/assessment-admin-mvvm-production` | PASS: production assets, no Angular build warnings; separate output preserves the running watcher |
| Source/type audit | `npx tsc --noEmit --noUnusedLocals --noUnusedParameters -p tsconfig.app.json` | PASS |
| Architecture audit | Source scan across `src/**/*.ts` | PASS: 16 inline OnPush components, component-specific BEM names, no component HTTP/adapter imports; root stores have no router/snackbar dependencies |
| Whitespace | `git diff --check` | PASS |
| Hosted catalog/create/edit | Existing Chrome tab at `https://admin.ngx-workshop.io/assessment-tests`, local development bundle/service | PASS: search/no matches/clear; edit existing local 51-question fixture; return to catalog; create starts with an empty pristine draft |
| Hosted workspace/review | Questions, review page 2, expand feedback, Edit question 11 | PASS: one editor/12 outline entries; ten review rows; correct answer/feedback; return focuses question 11 |
| Responsive integration | Temporary 320px viewport, DOM measurements and screenshot | PASS: document client/scroll widths both 320; one editor/12 outline entries; viewport restored |

Executed with installed Node 24.9.0 and Chrome Headless 155. The development guide's
recommended CI runtime is Node 22; this run did not separately execute on Node 22.
Mutation and failure checks use controlled observables/HttpTestingController;
hosted checks did not save, delete or otherwise persist assessment changes.

## Federation compatibility

Hosted verification caught Angular interop helpers resolving a second core context
(NG0203/NG0201), which standalone tests did not expose. The form bridge uses merged
value/status streams mapped to fresh control snapshots inside a shared-core effect
with explicit cleanup. It avoids that duplicate context while preserving reactive
updates when readiness status stays unchanged across structural edits. Other request
subscriptions retain explicit DestroyRef. The final hosted workspace rendered after
this repair. Existing host Material component-ID collision warnings were observed;
shared dependency/federation configuration was preserved and no shell changes made.

## Contracts and remaining work

No API, DTO, URL, dependency, route, export, federation, backend or migration changes
are required. No deployment, commit or push performed. Production gateway/auth and
real production writes were outside this refactor's verification scope. No remaining
local tasks. The development watcher/server remain running; the browser is returned
to the catalog without persisted changes.

Architecture/development docs, feature index and constitution now describe the
accepted standards and source boundaries. Historical feature records remain intact.


## Follow-up: component and test directory organization

Completed 2026-10-07 at the user's request. Assessment components/view models now
live in `src/app/assessment-tests/catalog`, `wizard` and `question-workspace`.
All six spec files moved to a root `testing/app` tree that mirrors the application
features, services and state. The feature-wide authoring suite remains at the
assessment-test feature root. Relative imports and route imports were updated;
application behavior and federation exports are unchanged.

The Karma discovery pattern and test TypeScript include now select the external
test tree; application compilation explicitly excludes it. Verification: all 33
existing tests pass from the six relocated files; production build into
`/tmp/assessment-admin-structure-production` passes. Source/type and whitespace
checks pass. Architecture, development and constitution document the convention.
