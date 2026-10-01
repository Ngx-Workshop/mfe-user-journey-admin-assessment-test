# Admin assessment authoring

Angular micro-frontend for managing Ngx-Workshop assessment definitions. The source
contains a filterable catalog and a Basics → Questions → Review create/edit wizard,
using Angular Material, signals and typed reactive forms. It consumes
`@tmdjr/service-nestjs-assessment-test-contracts` version `0.0.15`.

The implementation has known save-mapping, deletion feedback and navigation/state
gaps. Read [authoring readiness](docs/assessment-readiness.md) before assuming the
current CRUD flow works end to end. “Publish” in wizard copy means no separate
publication action: the client currently creates/updates mutable definitions.

Start with [AGENTS.md](AGENTS.md), [architecture](docs/architecture.md),
[development](docs/development.md), the [specification workflow](.specify/README.md)
and [feature index](specs/README.md).

## Local commands

Use Node 22 and `npm ci`. `npm start` serves on port 4201.
`npm run dev:bundle` combines a **production** watch build with a CORS-enabled static
server on 4201. Check for an existing remote using that port first. Neither command
configures the assessment API proxy; the client uses `api/assessment-test`, resolved
against the document base URL.

`npm run build` outputs `dist/mfe-user-journey-admin-assessment-test`.
`npm test -- --watch=false --browsers=ChromeHeadless` invokes Karma, but no source
spec files are present in the reviewed baseline. A test script is not coverage.

Federation currently retains the name `ngx-seed-mfe`, entry `remoteEntry.js`, and
exposes `./Component` (default App) and `./Routes` (named Routes). Coordinate host
registration before changing these identifiers. Pushes to main trigger production
deployment. This documentation migration did not change or deploy runtime code.
