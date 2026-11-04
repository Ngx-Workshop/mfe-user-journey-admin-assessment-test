import { NgxInlineStatus } from '@tmdjr/ngx-workshop-design-system';
import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
@Component({
  selector: 'ngx-assessment-wizard-heading',
  imports: [NgxInlineStatus],
  template: ` <header class="assessment-wizard-heading__page-header">
    <div class="assessment-wizard-heading__titles">
      <p class="assessment-wizard-heading__eyebrow">
        Assessment wizard
      </p>
      <h1>
        {{
          name().trim() ||
            (mode() === 'create'
              ? 'Create assessment test'
              : 'Edit assessment test')
        }}
      </h1>
      <p class="assessment-wizard-heading__lede">
        {{
          step() === 0
            ? 'Set up your assessment, build questions, then review before saving.'
            : step() === 1
              ? 'Choose a question from the outline. Your edits stay with you as you move.'
              : 'Check the order, answers and feedback before saving your assessment.'
        }}
      </p>
    </div>
    <ngx-inline-status [label]="dirty() ? 'Unsaved changes' : mode() === 'edit' ? 'Saved assessment' : 'New assessment'" [tone]="dirty() ? 'warning' : 'neutral'" />
  </header>`,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
      }
      .assessment-wizard-heading__page-header {
        display: flex;
        align-items: start;
        justify-content: space-between;
        gap: 0.5rem;
      }
      h1 {
        overflow-wrap: anywhere;
        margin: 0 0 0.25rem;
        font-size: 1rem;
        font-weight: 600;
        letter-spacing: -0.025em;
      }
      .assessment-wizard-heading__eyebrow {
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.13em;
        font-size: 0.7rem;
        font-weight: 600;
        color: var(--ngx-color-primary);
      }
      .assessment-wizard-heading__lede {
        color: var(--ngx-color-muted);
        font-size: 0.9rem;
        margin: 0;
        line-height: 1.6;
      }
      .assessment-wizard-heading__eyebrow { display: none; }
      @media (max-height: 650px) and (max-width: 1000px) {
        .assessment-wizard-heading__titles { min-width: 0; }
        h1 { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        ngx-inline-status { flex-shrink: 0; max-width: 110px; font-size: 0.65rem; }
      }
      @media (max-width: 850px) {
        .assessment-wizard-heading__page-header {
          flex-direction: row;
        }
        .assessment-wizard-heading__lede { display: none; }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssessmentWizardHeadingComponent {
  readonly name = input.required<string>();
  readonly dirty = input.required<boolean>();
  readonly mode = input.required<'create' | 'edit'>();
  readonly step = input.required<number>();
}
