import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'ngx-assessment-wizard-heading',
  imports: [MatIconModule],
  template: ` <header class="assessment-wizard-heading__page-header">
    <div class="assessment-wizard-heading__titles">
      <p class="assessment-wizard-heading__eyebrow">Assessment wizard</p>
      <h1>
        {{
          name().trim() || (mode() === 'create' ? 'Create assessment test' : 'Edit assessment test')
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
    <span class="assessment-wizard-heading__save-state"
      ><mat-icon>{{ dirty() ? 'edit' : 'cloud_done' }}</mat-icon
      >{{
        dirty() ? 'Unsaved changes' : mode() === 'edit' ? 'Saved assessment' : 'New assessment'
      }}</span
    >
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
        gap: 1rem;
      }
      h1 {
        overflow-wrap: anywhere;
        margin: 0.3rem 0 0.6rem;
        font-size: clamp(1.5rem, 2.5vw, 2rem);
        font-weight: 600;
        letter-spacing: -0.025em;
      }
      .assessment-wizard-heading__eyebrow {
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.13em;
        font-size: 0.7rem;
        font-weight: 600;
        color: var(--mat-sys-primary);
      }
      .assessment-wizard-heading__lede {
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.9rem;
        margin: 0;
        line-height: 1.6;
      }
      .assessment-wizard-heading__save-state {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.75rem;
        color: var(--mat-sys-on-surface-variant);
        white-space: nowrap;
        padding-top: 0.2rem;
      }
      .assessment-wizard-heading__save-state mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
      @media (max-width: 850px) {
        .assessment-wizard-heading__page-header {
          flex-direction: column;
        }
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
