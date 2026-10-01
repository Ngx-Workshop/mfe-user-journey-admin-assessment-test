# Development and verification

Use Node 22, matching CI, and the committed lockfile. Commands run from this repo.

| Purpose | Command | Notes |
| --- | --- | --- |
| Install | `npm ci` | Scoped package access may be required |
| Dev server | `npm start` | Development configuration, port 4201 |
| Bundle watch | `npm run watch` | Uses production configuration in this repository |
| Hosted-shell loop | `npm run dev:bundle` | Production watch + CORS-enabled static serving on 4201 |
| Production build | `npm run build` | Outputs dist/mfe-user-journey-admin-assessment-test |
| Unit tests | `npm test -- --watch=false --browsers=ChromeHeadless` | Karma configured; no source spec files in baseline |

No lint script or configured end-to-end runner exists. The bundle server does not
proxy API calls. `api/assessment-test` resolves against the hosting document's base;
configure a deliberate proxy/API boundary before local mutations. Do not assume
loading a localhost remote makes API requests local. Check port 4201 occupancy and
preserve other running remotes. Use a separate build output path if a watch session
already serves this repo's dist folder.

## Checks for implementation work

1. Add focused form-mapping tests with real raw values and nested questions; a cast
   is not a conversion from data into Angular controls.
2. Test choice editing/removal and answer membership, whitespace, duplicate choices,
   question minimums and integer levels once the intended rules are agreed.
3. Test failed delete retaining the row, load failure distinct from empty results,
   save/fetch failure recovery and prevention of duplicate submissions.
4. Test create/edit/back under the host mount, route-ID changes on reused wizard,
   unsaved navigation protection and standalone shell composition.
5. Check keyboard access and accessible names, narrow layouts, step navigation and
   feedback preview. Use HTTP doubles for unit tests and disposable data for live checks.
6. Build after runtime changes, verify federation exports/providers, and separately
   validate auth/gateway behavior. Do not equate a successful build with CRUD success.

## Current verification status

Source was read for this Markdown migration. No package install, build, app test,
browser flow or live API mutation was run. No source `.spec.ts` files exist, so there
is no established passing unit suite. See [readiness](assessment-readiness.md) for
specific observed defects and compatibility decisions. Documentation checks cover
local links, copied template parity, Markdown-only scope and whitespace.
