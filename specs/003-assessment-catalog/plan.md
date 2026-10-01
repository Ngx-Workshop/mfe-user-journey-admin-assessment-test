# Plan: Assessment catalog
Spec: [spec.md](spec.md)
Status: Complete; locally verified

## Design
Replace the accordion component with a semantic row list retaining its internal selector for compatibility. Native details contains at most three prompt previews, with all editing in the wizard. Use Material controls and date pipe. Parent owns filtering and pagination; reset page on filter/sort changes and clamp computed page after data changes. Compact filters use responsive CSS grid. Move create action into the catalog header, keep shell navigation.

## Constitution and boundaries
All six principles satisfied: focused Angular standalone components, signals, service-only HTTP, unchanged federation and API, accessible verification, local documentation. No external dependency changes or migrations. Existing uncommitted wizard files are preserved.

## Verification
Test filtering/page reset/clamping and bounded previews with 25 definitions and 50-question data. Run full ChromeHeadless suite and production build to a separate path. Check hosted local MFE desktop, search, no matches, preview/edit navigation and narrow mobile. No production mutations.
