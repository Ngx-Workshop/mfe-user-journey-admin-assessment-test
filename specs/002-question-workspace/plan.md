# Plan

Extract a focused question workspace component with typed form input. The parent retains API and wizard lifecycle ownership. Keep stable FormGroup identities for selection and movement; derive outline state from form value changes with explicit cleanup. Render 12 outline entries per page and one editor. Inline undo retains the removed control for the current workspace session. Review uses 10 collapsed summaries per page.

No new dependency, persisted field or service contract. Use native buttons/details and Material inputs. Test component behavior with real forms and a 50-question fixture, existing wizard regressions, production build and hosted browser against isolated local data.
