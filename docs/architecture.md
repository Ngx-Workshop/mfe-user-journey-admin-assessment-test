# Architecture — admin assessment authoring

Source baseline: `acf3822`, reviewed 2026-09-30. These are source observations;
no live authoring, gateway or production behavior was tested during this migration.

## Responsibility

This remote edits assessment definitions: name, subject, level, questions, choices,
correct answer and correct/incorrect feedback. It does not own learner attempts,
scoring, eligibility, authentication, or database persistence. Unlike the learner
assessment remote's current seed CRUD, this repository has assessment-specific UI.
It is not a Coding Labs editor and has no code runner, immutable version history,
draft state or distinct publish endpoint.

## Source map

| Concern | Source | Observed behavior |
| --- | --- | --- |
| Startup | `src/main.ts`, `src/bootstrap.ts` | Deferred standalone App bootstrap |
| Providers | `src/app/app.config.ts` | Zoneless, HTTP with DI interceptors, animations, reactive forms, provideRouter(Routes) |
| Root shell | `src/app/app.ts` | Particle header, sticky action bar, previous-navigation Back link, create action, router outlet; 70vw clamp body wrapper |
| Routes | `src/app/app.routes.ts` | Root App with list, tests/new and tests/:id children; wildcard redirect |
| List | `src/app/assessment-tests/assessment-test-list/assessment-test-list.component.ts` | Loads definitions; signals/computed client-side filters/sort; edit/create/delete navigation |
| Filters | `src/app/assessment-tests/assessment-test-list/assessment-test-list-filters.component.ts` | Text, subject, max level, sort, clear events |
| Results | `src/app/assessment-tests/assessment-test-list/assessment-test-list-accordion.component.ts` | Expand questions/choices/answer keys; edit/delete outputs; unwired refresh button |
| Empty state | `src/app/assessment-tests/assessment-test-list/assessment-test-list-empty-state.component.ts` | Create action for zero results, including filtered/error-derived emptiness |
| Wizard | `src/app/assessment-tests/assessment-test-wizard.component.ts` | Basics/Questions/Review; create or edit according to route ID |
| Forms | `src/app/services/assessment-test-form.service.ts` | Typed FormGroups/FormArrays, defaults, validators and payload mapper |
| HTTP | `src/app/services/assessment-tests-api.service.ts` | Definition list/get/create/update/delete |
| Federation | `webpack.config.js`, `webpack.prod.config.js` | Seed identity; production reuses base config |

## Authoring flow and data

The list filters downloaded data by name/subject/level text, subject enum and maximum
level, then sorts by lastUpdated descending, name ascending or level descending.
Filters are local signals, not URL/persistent state. A load error shows a snackbar
and substitutes an empty array. Accordion expansion includes answer keys, appropriate
to an admin view but not a learner payload specification.

Wizard Basics requires name (max 160), subject (ANGULAR/NESTJS/RXJS), level >= 1.
New forms start with one blank question and Choice A / Choice B. Questions require
prompt (max 1000), nonempty choices (max 400 each), a selected answer, and both
feedback texts (max 1000). UI removal helpers retain one question/two choices.
There is no integer-level validator, trimmed-nonempty check, choice uniqueness check
or validator tying the stored answer to the current choice strings.

Review shows name, subject, level, questions/choices with the selected answer
highlighted; it omits feedback texts. Submit is intended to map the form, POST/PATCH,
show a snackbar and navigate back. The current raw-value/control mismatch prevents
relying on that save path; see readiness review. There is no backend publication
state transition despite the wizard introduction saying “publish”.

## HTTP contract

Client base string is `api/assessment-test` **without a leading slash**. The standalone
index declares base href `/`, so this resolves to `/api/assessment-test` there. Hosted
resolution depends on the host document base, not simply the current router path.
No environment switch or local proxy is configured in this checkout.

| Method | Client target | Body/result |
| --- | --- | --- |
| GET | base | AssessmentTestDto[] |
| GET | base/:id | AssessmentTestDto |
| POST | base | Locally defined AssessmentTestPayload → AssessmentTestDto |
| PATCH | base | Same full payload plus _id → AssessmentTestDto |
| DELETE | base | ID string as request body; void expected |

The payload shape is name, subject, level, testQuestions; choice strings map to
`{ value }` objects. Server-managed IDs/timestamps are not included on create.
The DTO dependency is `@tmdjr/service-nestjs-assessment-test-contracts` 0.0.15, listed
under devDependencies. There is no local OpenAPI copy or generation script. The
client does not explicitly set withCredentials; same-origin cookies and any host
interceptors need to be considered separately from cross-origin local API access.

## Routing and host boundary

Exposed `Routes` mounts App as a route shell, with list at empty child path,
`tests/new` before `tests/:id`, and a wildcard redirect. App exports both named and
default symbols. Standalone bootstrap also creates App while its route array mounts
App, so check for duplicate shell composition when exercising standalone startup.
Child navigation and `../../` wizard exits must be verified under the real host mount.
Loading the exposed component alone does not automatically install appConfig providers.

Remote name/root selector remain `ngx-seed-mfe`; HTML title is `NgxSeedMfe`. Shared
Angular/Material/CDK 21.1.0, RxJS 7.8.2, tslib 2.8.1, metadata ^21.0.4 and headers
21.0.5 use strict singleton settings. Federation and ngx-build-plus are 20-series.
This manifest snapshot is not proof of compatibility with every host version.

## External owners and release

| Owner | Boundary |
| --- | --- |
| service-assessment-test | Definition validation/persistence, roles, lifecycle and generated contract package; native prefix /assessment-test |
| mfe-user-journey-assessment-test | Learner experience; answer-key redaction, feedback timing and attempt effects need a producer/consumer agreement |
| Admin shell / orchestrator | Mount path, remote identity/registry, providers, theme and session-local bundle override |
| BFF / Nginx | Browser API prefix and forwarding; client source alone does not verify deployed routing |
| Platform auth / user metadata | Session and role context; this remote declares no route guards |

Build output is `dist/mfe-user-journey-admin-assessment-test`, local port 4201. The
Node 22 workflow builds and copies assets to `/opt/mfe-remotes/mfe-user-journey-admin-assessment-test/`
on main push/manual dispatch. It does not run unit tests or configure the host registry.
