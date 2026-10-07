# Constitution — Admin assessment authoring

Version: 1.1.0 · Adopted: 2026-09-30 · Updated: 2026-10-07

These are design requirements for future work, not a claim that every inherited
implementation already satisfies them. Current gaps live in the development guide.

## 1. One remote, one responsibility

Ngx-Workshop is a learning platform using independently maintained repositories.
A remote owns a focused user journey or a structural element. The host shell
loads and composes remotes. Do not nest remotes or assume ownership of global
navigation, authentication, or other journeys. This remote owns definition authoring;
learner attempts belong to the learner remote and service. Do not silently introduce
draft/publication semantics that the assessment service does not implement.

## 2. Preserve integration contracts

Treat `remoteEntry.js`, exposed modules, exported symbols, route behavior, shared
singletons, and HTTP contracts as public interfaces. Document compatibility and
consumer impact before changing them. The gateway owns routing from browser API
paths to services; this remote does not choose production service addresses.

## 3. Follow the Angular model already in use

Use standalone components, zoneless-compatible state updates, Angular Material,
typed reactive forms, signals for local state, and RxJS for asynchronous flows.
Prefer focused components and services; use `OnPush` where appropriate. Avoid
introducing another state framework or weakening types without a demonstrated need.
Keep Angular and federation shared versions aligned with the consuming shell.


Use MVVM: keep the HTTP adapter stateless and separate from root-provided stores
that own server data and request orchestration. Keep unsaved forms, filters and
selection in local view models. Journey orchestration coordinates stores and
navigation; presentation receives typed inputs and emits intent. Nested
orchestration components are appropriate for a cohesive workspace.
Use switchMap for replaceable reads and terminate subscriptions on destroy.
Components own inline HTML and SCSS with BEM class names. Aim for approximately
230 lines per component, allowing modest exceptions for cohesive markup/styles.
Use OnPush and verify reactive updates across presentation boundaries.

Group assessment components and their view models by responsibility (`catalog`,
`wizard`, `question-workspace`). Keep specs outside production source under a root
`testing/` tree mirroring `src/`, with discovery configured explicitly.

## 4. Put data ownership on the server

Use published DTO contracts and explicit request mapping. Frontend visibility and
route guards support the user experience; backend authorization remains necessary. Answer keys and feedback belong in the
admin authoring contract; the service must decide what learners can see. Preserve
question/choice/answer integrity and define effects on existing attempts before
changing definitions.
Keep credentials and privileged operations out of browser assets. Do not infer
authorization rules from the seed's demonstration CRUD interface.

## 5. Make behavior observable and verifiable

Specify acceptance scenarios before nontrivial implementation. Cover loading,
empty, success, validation, and failure states appropriate to the feature. Preserve
keyboard access, useful labels, and responsive behavior. Test observable outcomes
and integration boundaries; do not treat a successful build as end-to-end proof.

## 6. Keep knowledge local and current

An agent with this checkout alone must be able to understand its responsibilities,
contracts, and verification steps. Record external dependencies and handoffs in the
feature folder. Distinguish assumptions, source observations, and verified results.

## Amendments

Change these principles intentionally with a rationale and version/date update.
Review affected architecture docs and templates at the same time. A justified
feature-specific exception belongs in its plan, with impact and follow-up stated.


2026-10-07 (1.1.0): Adopted the user's MVVM, singleton-state/data-access separation,
inline template/SCSS, BEM and approximate component-size standards. This makes the
architecture requirements durable for subsequent work.
