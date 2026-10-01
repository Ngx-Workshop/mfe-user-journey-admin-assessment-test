# Handoff: Assessment catalog
Status: Complete; locally verified
Updated: 2026-10-01
See [spec](spec.md), [plan](plan.md), [tasks](tasks.md).

## Delivered
Compact themed rows expose name, subject, level, question count, update date and Edit. A secondary menu contains Delete; its existing confirmation and failure handling remain. Expandable previews contain at most three prompts. Full answer/feedback review remains in the wizard. Ten-row pagination resets on filter/sort changes and clamps after data changes. Maximum level uses actual catalog levels and an explicit Any level option. Responsive toolbar, create action, loading/error/empty/no-match states and service restriction copy complete the catalog.

## Verification
- 22 ChromeHeadless tests pass, including three catalog scenarios with 25 definitions and 50 questions per definition: pagination/clamping, combined filters/reset/no matches, bounded previews/correct edit target. Existing failure tests pass.
- Production build passes without warnings; separate output /tmp/assessment-catalog-production preserves running development assets.
- Hosted shell with the real local service: two existing local fixtures, 51-question preview bounded to three, no-match recovery, Angular subject filtering, Edit loads correct saved fixture and returns to catalog.
- 320px viewport: screenshot inspected, document scrollWidth equals innerWidth (320), no horizontal overflow; default viewport restored.
- Whitespace check passes. Browser test made no data mutations. Pagination at scale is verified by automated tests, not by creating extra database fixtures.

## Contracts and remaining work
No service, API, federation or routing changes. No migrations or external work required. Not committed, pushed or deployed. Prior uncommitted wizard work is preserved. Catalog preview remains open in the hosted shell using local assets.

## Context
Architecture, development guide and feature index updated.
