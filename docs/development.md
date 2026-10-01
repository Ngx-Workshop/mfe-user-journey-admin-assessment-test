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
