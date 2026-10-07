# Implementation plan: Assessment authoring MVVM

Status: Implemented and verified
Updated: 2026-10-07
Baseline: abc080e; working tree clean. Angular 21.1, RxJS 7.8.2; installed dependencies available.

## Source findings

The HTTP service already has no mutable state. The 426-line catalog mixes requests, server state, filters and rendering. The wizard manually manages load subscriptions, save orchestration and server version. Wizard and workspace use external HTML/SCSS; their combined sources exceed 750 lines each. Existing presentation leaves use inline content but generic classes. Existing regressions cover failure/navigation, catalog and large assessments.

## Design and sequence

1. Extract payload/domain types from the form builder so HTTP does not depend on form construction. Keep compatibility type exports for existing consumers.
2. Add root-provided catalog and editor stores with private writable state/public readonly signals, lazy observable operations, error recovery, cancellation cleanup and mutation guards. RxJS owns asynchronous lifetimes; Angular signals expose synchronous view state. Stores have no router, snack bar or component dependencies.
3. Extract a local catalog view model for filters, sorting and pagination. Keep the catalog orchestrator responsible for navigation, confirmation and success feedback; move catalog markup into a typed presentation view.
4. Make wizard route loading a switchMap stream combining route IDs and retry intent. Keep form and step state local. Split basics and paged review into presentation components; move step validation/review derivation to a local wizard view model.
5. Split question workspace into its local selection/structure view model, workspace orchestration, outline presentation and selected-question form presentation. Preserve form-group identity and accessible focus behavior.
6. Inline every component template/style, rename owned classes to BEM, apply OnPush, remove obsolete HTML/SCSS. Keep component files focused around 230 lines where practical; document justified exceptions.
7. Extend behavioral tests at new store/cancellation boundaries; run the complete regression suite, production build into a separate output folder, source audit, and read-only hosted smoke checks. Update architecture/development and handoff.

## Constitution and compatibility

All six principles satisfied: one remote, stable integration, standalone zoneless signals/RxJS, published contract types, outcome-based regression coverage, local documentation. No new runtime dependencies or state framework. No persistence migrations. Existing router/federation/API interfaces remain. Main risk is lifecycle changes across extraction: explicitly test stale-load cancellation, retry, pending mutation suppression and component destruction. Another risk is style encapsulation after splitting: retain relevant styles in each child and verify hosted rendering.

## Verification

AC-001/002: store and existing authoring failure tests with controlled request streams.
AC-003: complete Karma ChromeHeadless suite plus child rendering checks.
AC-004: production build in /tmp, structural source audit and hosted catalog/create/edit inspection. No save/delete against hosted data.


## Implementation evidence and resolved details

All seven steps implemented; [handoff](handoff.md) records final checks. The local
form bridge uses effect-owned merged form streams rather than implicit Angular
interop helpers because hosted federation testing exposed a duplicate core context.
The new outline host owns sticky positioning. Two cohesive components retain modest
258/261-line exceptions to the approximate size target. No contract changes.
