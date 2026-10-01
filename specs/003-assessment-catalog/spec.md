# Feature: Assessment catalog polish
Status: Complete; locally verified
Created: 2026-10-01
Request: Polish the Assessment Tests list.

## Problem and scope
Administrators need to scan and find definitions without opening a wall of question content. Source: assessment-test-list components currently hide actions and render every question on expansion.

## Requirements and acceptance
- FR-001 / AC-001: Show name, subject, level, question count and updated date with direct Edit and labeled secondary actions. Preview only three prompts; full editing stays in the wizard.
- FR-002 / AC-002: Combine search, subject, maximum level and sorting in a responsive toolbar. Filter changes reset pagination; zero matches offers reset.
- FR-003 / AC-003: Limit catalog to ten rows per page; clamp pages after refresh/deletion. Counts reflect filtered results.
- FR-004 / AC-004: Distinguish initial loading, refresh, errors, empty catalog and no matches. Preserve rows on failure and existing confirmation/deletion semantics.
- FR-005 / AC-005: Match wizard theme and bounded wrapper; keyboard labels and 320px mobile layout without horizontal overflow.

## Boundaries and success
No API, service, publication lifecycle or deployment changes. Preserve earlier wizard work. Unit tests, production build and hosted local-MFE checks establish completion. Dates use the existing lastUpdated contract; no new metadata is inferred.
