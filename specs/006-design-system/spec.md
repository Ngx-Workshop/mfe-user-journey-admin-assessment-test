# Feature: Assessment authoring design system

Status: Complete
Feature ID: 006-design-system
Created: 2026-11-03
Updated: 2026-11-03
Request/source: Migrate the running admin assessment test creator to the installed design system.

## Problem and scope

The catalogue's large hero and spacious cards put authoring below the fold and differ from the other admin tools. Migrate the catalogue, basics, question workspace and review. Preserve the existing definition lifecycle, validation, answer mapping, pagination, section subjects, guarded navigation and API/federation contracts. No backend changes or publication lifecycle.

## Requirements and acceptance

- FR-001 / AC-001: Catalogue uses the shared action bar and filter/results panels with compact rows. Search, subject/level/sort, pagination, preview, create/edit/delete and empty/loading/error recovery remain available.
- FR-002 / AC-002: Wizard uses compact shared controls and semantic tokens; its navigation and actions stay visible while content scrolls within the available viewport. Basics and review preserve labels, errors, feedback and paged editing.
- FR-003 / AC-003: Questions use separate outline/editor panels, bounded scrolling, compact selection rows, and existing structural operations, validation targeting and undo. Narrow screens switch between panels without losing edits.
- FR-004 / AC-004: Preserve default App/Routes exports, HTTP methods/URLs/payloads, store ownership and unsaved guards; no API or persistence migration.

## Success criteria

Regression tests, application/spec type checks, source layout checks, and isolated production build with license output pass. Hosted shell catalogue and wizard verified on desktop and narrow screens using the existing local service. No production writes required.

## Assumptions

The user-installed 21.0.10 design system and configured federation remain intact. Existing local definitions can be read to verify editing; unsubmitted local form interactions verify layout without changing stored definitions.
