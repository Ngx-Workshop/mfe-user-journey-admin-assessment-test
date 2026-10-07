# Feature: Assessment authoring MVVM refactor

Status: Complete; locally and hosted verified
Feature ID: 004-mvvm-refactor
Created: 2026-10-07
Request: Refactor the complete administrator assessment MFE to MVVM with idiomatic streams, singleton state separate from HTTP, focused orchestration/presentation components, inline HTML/SCSS and BEM.

## Scope and requirements

- FR-001: Only the stateless data access service makes HTTP requests. Singleton stores own asynchronous request state, error translation and server data; components consume their public state and commands.
- FR-002: Local view models own derived catalog and editing state. Presentational components receive typed inputs and emit user intent. Nested orchestration is appropriate for the question workspace.
- FR-003: Component templates and SCSS live inline in their TypeScript file. Use component-specific BEM classes. Aim for approximately 230 lines per component; prefer cohesive responsibility to artificial fragmentation.
- FR-004: Preserve catalog filtering, sort, pagination, retry, failure retention, and bounded previews; preserve authoring validation, route reuse, cancellation, optimistic version, unsaved guards, bounded questions/review, selection identity, duplication, movement and undo.
- FR-005: Keep federation exports, routes, dependency versions, API URLs and DTO payloads compatible. No backend or publication changes.

## Acceptance

- AC-001 (FR-001, FR-004): Failed requests expose recoverable errors, release pending state, retain rows/edits and never emit success. Repeated pending mutations issue one request.
- AC-002 (FR-001, FR-004): Changing editor route cancels obsolete loads; retries and edit-to-create navigation cannot retain stale data, errors or versions.
- AC-003 (FR-002, FR-004): Existing catalog, typed-form and 50-question workspace behavior passes regressions after extraction, including DOM rendering through child components.
- AC-004 (FR-003, FR-005): Source audit finds no external component templates/styles or component HTTP dependencies. Production compilation and hosted read-only smoke checks verify integration where available.

## Assumptions and boundaries

Preserve the visible journey rather than redesigning it. HTTP integration remains the existing published assessment contract (manifest 0.0.18). The running host can be inspected without modifying real definitions. Local mocks verify mutations; no production data writes are required. Server state is singleton; unsaved reactive forms, filters and workspace selection remain local to their mounted journey.
