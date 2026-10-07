# Tasks: MVVM refactor

- [x] T001 — Extract domain types and singleton stores (FR-001; AC-001/002).
- [x] T002 — Extract catalog view model and presentation (FR-002/003; AC-003).
- [x] T003 — Refactor wizard streams/view model and basics/review presentation (FR-001/002/003; AC-002/003).
- [x] T004 — Extract question workspace view model, outline and fields (FR-002/003; AC-003).
- [x] T005 — Apply inline SCSS/BEM/OnPush throughout; audit interfaces and source (FR-003/005; AC-004).
- [x] T006 — Add boundary regressions, run full tests/build, inspect hosted UI (FR-004/005; AC-001–004).
- [x] T007 — Update architecture/development, feature index and handoff with actual evidence.

Dependencies follow order above; T006 validates all implementation tasks. No external repository changes required.


## Final evidence

All local tasks complete. T001/T002/T003/T004: 33 passing regressions and hosted
catalog/create/edit/question/review checks. T005: all 16 components inline/OnPush/BEM;
no component HTTP dependencies, with documented 258/261-line cohesive exceptions.
T006: production build, strict unused-symbol type check and whitespace audit pass.
T007: architecture, development, constitution and feature index updated; see
[handoff](handoff.md) for actual commands, scope and integration limitations.
