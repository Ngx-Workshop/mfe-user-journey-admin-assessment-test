# Assessment Tests<br><sup>MFE User Journey - Publisher</sup>

<img src="https://github.com/Ngx-Workshop/.github/blob/main/readme-assets/angular-gradient-wordmark.gif?raw=true" height="132" alt="Angular Logo" /> <img src="https://github.com/Ngx-Workshop/.github/blob/main/readme-assets/module-federation-logo.svg?raw=true" height="132" alt="Angular Logo" />

Angular micro-frontend (remote) for the **Admin Backstage** user journey in the NGX Workshop ecosystem.

This project is an Angular Module Federation remote for the NGX Workshop “Admin Assessment Tests” experience. It exposes a standalone shell component and route configuration for host integration, and provides a full CRUD UI for assessment tests (list, filter, create, edit, delete) built with Angular Material, signals, and typed reactive forms.

Key capabilities:

- Assessment test list with filtering, sorting, and empty states.
- Multi-step wizard for creating and editing tests with validation.
- API integration for list/create/update/delete operations.
- Module Federation exposure for both component and route integration.

## Getting started

### Prerequisites

- Node.js and npm
- Angular CLI (optional, project uses local CLI)

### Install dependencies

- `npm install`

### Run the remote locally

- `npm start`

This serves the remote with a Webpack Module Federation entry at /remoteEntry.js.

### Run with the MF dev server (optional)

- `npm run run:all`

### Tests

- `npm test`

### Backend/API

The UI expects the backend to be reachable at `/api/assessment-test` (see [src/app/services/assessment-tests-api.service.ts](src/app/services/assessment-tests-api.service.ts)). Configure the host or local dev server to proxy that path to your API.

## Architectural overview

### Module Federation

- Remote name: `ngx-seed-mfe`
- Remote entry: `remoteEntry.js`
- Exposes:
  - `./Component` → [src/app/app.ts](src/app/app.ts)
  - `./Routes` → [src/app/app.routes.ts](src/app/app.routes.ts)

See [webpack.config.js](webpack.config.js) for the federation configuration and shared library settings.

### Bootstrapping

- [src/main.ts](src/main.ts) dynamically imports [src/bootstrap.ts](src/bootstrap.ts).
- [src/bootstrap.ts](src/bootstrap.ts) bootstraps the standalone `App` component with [src/app/app.config.ts](src/app/app.config.ts).
- The app uses zoneless change detection and async animations (see [src/app/app.config.ts](src/app/app.config.ts)).

### Routing

Routes are defined in [src/app/app.routes.ts](src/app/app.routes.ts):

- `/` → assessment test list
- `/tests/new` → create wizard
- `/tests/:id` → edit wizard

### UI composition

- App shell (header + action bar): [src/app/app.ts](src/app/app.ts)
- List view and filters:
  - [src/app/assessment-tests/assessment-test-list/assessment-test-list.component.ts](src/app/assessment-tests/assessment-test-list/assessment-test-list.component.ts)
  - [src/app/assessment-tests/assessment-test-list/assessment-test-list-filters.component.ts](src/app/assessment-tests/assessment-test-list/assessment-test-list-filters.component.ts)
  - [src/app/assessment-tests/assessment-test-list/assessment-test-list-accordion.component.ts](src/app/assessment-tests/assessment-test-list/assessment-test-list-accordion.component.ts)
  - [src/app/assessment-tests/assessment-test-list/assessment-test-list-empty-state.component.ts](src/app/assessment-tests/assessment-test-list/assessment-test-list-empty-state.component.ts)
- Wizard (create/edit): [src/app/assessment-tests/assessment-test-wizard.component.ts](src/app/assessment-tests/assessment-test-wizard.component.ts)

### Data flow

- API access: [src/app/services/assessment-tests-api.service.ts](src/app/services/assessment-tests-api.service.ts)
- Form creation and validation: [src/app/services/assessment-test-form.service.ts](src/app/services/assessment-test-form.service.ts)
- State management uses Angular signals inside the components, with `OnPush` where appropriate.
