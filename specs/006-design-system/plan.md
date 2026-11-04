# Plan: Assessment design system

Status: Complete
Spec: [spec.md](spec.md)
Updated: 2026-11-03

## Source baseline and approach

Clean working tree at start; design system 21.0.10 installed. Existing Angular 21.1 MVVM and typed reactive forms are retained. Presentation uses public NgxActionBar/NgxPanel/NgxButton/NgxInlineStatus and theme tokens. Keep Material form controls and overlay classes. Local assessment panel and viewport helpers measure real space below shell/toolbars and scroll body content. No sibling runtime dependency.

| Requirement | Implementation boundary |
| --- | --- |
| FR-001 | App action bar; catalog presentation/filter/row components |
| FR-002 | Wizard presentation, bounded editor/controls, basics/review panels |
| FR-003 | Question workspace presentation, outline/editor panels and responsive panel selection |
| FR-004 | Leave forms/API/models/stores/view models/routes/package/Webpack untouched |

## Constitution and compatibility

One remote and public exports preserved. OnPush inline BEM views, typed intent outputs and local presentation state. No direct data access in presenters. Local viewport observers clean up on destroy. No dependency/backend/data migration. Host supplies authentication/theme; standalone theme initialization stays local.

## Verification

Run ChromeHeadless regressions and add focused panel selection/intent coverage; strict app/spec checks; check:layout; isolated production output (preserve the running watcher) and nonempty license file. Browser reads against hosted shell and existing local service: catalogue filter/preview/edit, basics/questions/review, selection and mobile overflow/scrolling. Saving/deleting covered by existing doubles rather than modifying existing local fixtures.

## Implementation findings

The inherited outline output was named `select`, which collided with native bubbling text-selection events in the search input. Hosted filtering reproduced a non-FormGroup selection and runtime error. Rename this internal intent to `questionSelect`; no exported federation or HTTP contract changes. Add a native bubbling select-event regression alongside responsive editor-selection and incomplete/add-question cases.

Public NgxPanel inputs/projection remain the layout boundary. A local wrapper measures panel chrome and scopes compact mobile styles to Material card elements; no private design-system classes are referenced. Components remain cohesive inline OnPush presenters; a few are within ten lines of the approximate 230-line target, avoiding artificial responsibility splits.
