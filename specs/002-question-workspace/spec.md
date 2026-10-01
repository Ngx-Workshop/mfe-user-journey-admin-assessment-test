# Scalable assessment wizard

Status: Implemented; locally verified

FR-001: Keep exactly one question editor visible with a searchable, numbered outline, completion status and an incomplete-only filter. Preserve unsaved values when changing selection or filters.
FR-002: Add, duplicate, reorder, remove and undo the latest removal without losing answer/feedback associations. Retain at least one question. Keyboard-accessible move controls are required; drag is not required.
FR-003: Show overall readiness and navigate directly to the first invalid question on review validation. Make review compact and paginated with direct edit links.
FR-004: Refine wizard hierarchy, spacing, progress and persistent actions using the host theme. Work on narrow screens without horizontal overflow.
FR-005: Preserve API shape, question order, validation, pending/error states and unsaved guards. No backend or deployment changes.

Acceptance: AC-001 author a 50-question assessment without 50 forms in the DOM; search and incomplete filtering remain live. AC-002 duplicate/move/remove/undo round-trip complete values and mark dirty. AC-003 invalid hidden questions open directly when proceeding to review. AC-004 compact review returns to the correct question and preserves order on save/reload. AC-005 verify desktop/mobile and regression suite/build.
