import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { AssessmentTestDto } from '@tmdjr/service-nestjs-assessment-test-contracts';

@Component({
  selector: 'ngx-assessment-test-list-summary',
  template: `
    <div class="summary">
      Showing {{ filteredCount() }} of {{ totalCount() }} tests @if
      (subjectFilter() !== 'ALL') { · Subject: {{ subjectFilter() }} }
      @if (levelCap() !== null) { · Level ≤ {{ levelCap() }}
      }
    </div>
  `,
  styles: [
    `
      .summary {
        margin: 0 0 0.5rem;
        opacity: 0.85;
        font-size: 0.95rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssessmentTestListSummaryComponent {
  readonly filteredCount = input.required<number>();
  readonly totalCount = input.required<number>();
  readonly subjectFilter = input<
    AssessmentTestDto['subject'] | 'ALL'
  >('ALL');
  readonly levelCap = input<number | null>(null);
}
