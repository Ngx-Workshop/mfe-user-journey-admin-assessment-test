# Seed adoption status — administrator assessments

The Markdown workflow is adopted from `seed-mfe-remote`. Workflow instructions and
four templates are copied unchanged; the entry point, constitution and context are
adapted to this repository. No historical Coding Labs feature records are copied.

| Area | Current state | Follow-up when implementing |
| --- | --- | --- |
| Package/build/deploy | Admin-assessment-specific | Preserve target compatibility |
| UI/domain | Assessment list and three-step wizard | Repair save mapping, failure states and authoring invariants |
| Routes/providers | Router and child routes configured | Verify host mount, route reuse and standalone shell behavior |
| Contracts/API | Assessment package 0.0.15; relative api/assessment-test | Verify deployed producer contract, roles and gateway resolution |
| Federation/HTML identity | Seed name, selector and title | Coordinate any rename with host registry |
| Lifecycle | Direct create/update/delete | Do not assume publish/version/archive behavior from UI wording |
| Tests | Karma configuration, no specs | Establish meaningful authoring regression coverage |
| Documentation | Repository-local workflow and source review | Maintain alongside future features |

Read [readiness](assessment-readiness.md) before selecting implementation work.
Learner taking/scoring, coding challenge execution and service migrations are outside
this remote's ownership. Documentation migration does not authorize those changes.
