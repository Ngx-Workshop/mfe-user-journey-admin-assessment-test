# Development and verification

Use Node 22 and `npm ci`, matching CI.

| Purpose | Command |
| --- | --- |
| Standalone dev server | `npm start` |
| Development bundle watcher | `npm run watch` |
| Hosted shell bundle + static server on 4201 | `npm run dev:bundle` |
| Production build | `npm run build` |
| Regression tests | `npm test -- --watch=false --browsers=ChromeHeadless` |

Development bundles select `http://localhost:3005/assessment-test` via Angular file
replacement. Start the companion service with `npm run start:local` and MongoDB on
27017. That mode uses a separate database and synthetic local admin identity. The
host shell still requires its normal sign-in. A localhost remote alone does not
change backend targets; the environment replacement is essential.

Production uses `/api/assessment-test`. Use a separate output path (for example
`npx ng build --configuration production --output-path /tmp/assessment-admin-production`)
while the development watcher serves the normal dist folder. Do not interrupt another
remote's local server. If switching from the old production watcher, restart the
watch process once; the updated dev:bundle script then works normally.

Ten regression tests cover multi-question mapping, validation, stale answers,
structural edits, failed delete/load/save, duplicate saves, step jumps, route reuse
and unsaved work. Hosted Chrome checks verified list, editor, edit/save and return to
`/assessment-tests`; standalone verified creation. Hosted catalog and question editor
were checked at 390px with no horizontal overflow. Service tests cover actual deletion
and persistence conflicts. Browser checks use isolated local data, not production data.

Production builds and the test suite pass. Federation testing caught and fixed an
implicit DestroyRef injection issue not exposed by standalone tests. External release
still requires the matching service and production gateway/auth smoke checks.

## Scalable wizard verification

The current suite has 19 passing tests, including an eight-scenario real-form
workspace suite using 50 questions. It checks bounded rendering, live filtering,
selection persistence, independent duplication, arbitrary reordering, undo, new
questions and route/form replacement. Wizard tests also cover targeting invalid
questions and review pagination.

Hosted Chrome verification used a clearly labeled isolated local fixture: 50
questions grew to 51 through duplication, the copy moved from position 50 to 2,
removal/undo retained it, hidden validation errors were targeted, review page 2
returned to question 11, and save/reload preserved order and feedback. The outline
and question editor fit 390px and 320px viewports without horizontal overflow.
Production compilation passes within style budgets. No deployment performed for
this UX change.

## Catalog verification

The suite now has 22 passing tests. Catalog coverage adds 25-definition pagination
and clamping, combined filtering/reset/no matches, and bounded previews for
50-question definitions. Hosted local-service checks verified subject/search,
preview, direct Edit and return. The list fits 320px without horizontal overflow.
Production build passes without warnings. See [003 handoff](../specs/003-assessment-catalog/handoff.md).
