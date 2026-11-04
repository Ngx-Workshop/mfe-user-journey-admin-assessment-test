# Handoff: Assessment design system

Status: Complete
Spec: [spec.md](spec.md)
Plan: [plan.md](plan.md)
Tasks: [tasks.md](tasks.md)
Updated: 2026-11-03

## Delivered

Replaced the large catalogue hero and particle editor header with the shared action bar. Catalogue filters and compact rows occupy bounded panels; previews, paging, filtering, retry and action intents remain. Basics/review use shared scrollable panels. Wizard step navigation and footer actions remain outside the scrolling content. Questions use a 300px outline and selected editor with compact rows, responsive panel switches, themed fields/overlays and shared buttons/status. Selection/add/incomplete targeting opens the editor, retains controls and focuses its heading after rendering.

Native text selection formerly collided with the outline's `select` output. Renamed the internal output to `questionSelect` and verified the fix in the hosted shell and a regression test.

## Verification

| Check | Result / evidence |
| --- | --- |
| ChromeHeadless regression suite | PASS: 42 tests, including the original 39 and three selection/retention regressions. `/tmp/assessment-design-tests.log` |
| App strict unused checks | PASS: `./node_modules/.bin/tsc --noEmit --noUnusedLocals --noUnusedParameters -p tsconfig.app.json` |
| Spec type check | PASS: `./node_modules/.bin/tsc --noEmit -p tsconfig.spec.json` |
| Source layout / whitespace | PASS: `npm run check:layout`, `git diff --check` |
| Production build | PASS: `npm run build -- --output-path /tmp/assessment-design-production`; no compiler/budget warnings. License file nonempty (29,824 bytes). `/tmp/assessment-design-build.log` |
| Hosted catalogue | PASS: existing two local-service definitions, subject filter, no-match/clear, catalogue/editor/new navigation, themed select overlay. At 320×568 the page remains 320×568; results body scrolls 522px in a 203px viewport. |
| Hosted wizard | PASS: existing 51-question definition, new basics required errors, question outline search and selection of question 50, review page 2, existing subject fallback/error. Desktop panels bottom 892px and footer 970px in 986px viewport; editor keyboard End scrolls inside its body. |
| Narrow authoring | PASS: 390×844 and 375×568 panel switching; at 375×568 selected-editor body is 98px with 937px scrollable content, keyboard End reaches scrollTop 839, footer stays at 552px. Review panel scrolling/pagination available. Viewport reset after checks. |

Actual browser reads used the running shell/local assessment service. Save/delete/structural mutations remain covered by existing test doubles; no persisted definitions were changed. Optional subject catalogue GET against localhost:3007 currently fails; retry and existing-subject fallback remain visible. New subject selection succeeds in unit tests; a successful live creation was not claimed.

## Contracts and integration

No route, App/Routes export, federation exposure, dependency/lock/Webpack, API, form payload, store, backend, or data migration changes. Definition save semantics and used-definition protection are retained. No deployment/publication performed; running watcher/server preserved.

For live new-definition authoring, make the existing local document-sections service at localhost:3007 available and use Retry subjects. This is an environment dependency, not a new API requirement.

## Context maintenance

Architecture/development and feature index updated. No outstanding migration implementation tasks. Screenshot artifacts are in the current Codex visualization directory (`assessment-catalogue-design-system.jpg`, `assessment-authoring-design-system.jpg`).
