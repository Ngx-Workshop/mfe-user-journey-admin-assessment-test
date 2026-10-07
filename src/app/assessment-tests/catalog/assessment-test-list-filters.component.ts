import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AssessmentTestDto } from '@tmdjr/service-nestjs-assessment-test-contracts';

@Component({
  selector: 'ngx-assessment-test-list-filters',
  imports: [MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule],
  template: `
    <div class="assessment-filters__filters" role="search" aria-label="Filter assessments">
      <mat-form-field
        appearance="outline"
        subscriptSizing="dynamic"
        class="assessment-filters__search"
      >
        <mat-label>Find an assessment</mat-label><mat-icon matPrefix>search</mat-icon>
        <input
          matInput
          placeholder="Name, subject or level"
          [value]="query()"
          (input)="queryChange.emit($any($event.target).value)"
        />
        @if (query()) {
          <button
            mat-icon-button
            matSuffix
            aria-label="Clear search"
            (click)="queryChange.emit('')"
          >
            <mat-icon>close</mat-icon>
          </button>
        }
      </mat-form-field>
      <mat-form-field appearance="outline" subscriptSizing="dynamic"
        ><mat-label>Subject</mat-label>
        <mat-select
          [value]="subjectFilter()"
          (selectionChange)="subjectFilterChange.emit($event.value)"
        >
          <mat-option value="ALL">All subjects</mat-option
          ><mat-option value="ANGULAR">Angular</mat-option
          ><mat-option value="NESTJS">NestJS</mat-option><mat-option value="RXJS">RxJS</mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline" subscriptSizing="dynamic"
        ><mat-label>Maximum level</mat-label>
        <mat-select
          [value]="levelCap() ?? 'ALL'"
          (selectionChange)="levelCapChange.emit($event.value === 'ALL' ? null : $event.value)"
        >
          <mat-option value="ALL">Any level</mat-option>
          @for (level of levels(); track level) {
            <mat-option [value]="level">Level {{ level }} or below</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline" subscriptSizing="dynamic"
        ><mat-label>Sort by</mat-label>
        <mat-select [value]="sort()" (selectionChange)="sortChange.emit($event.value)"
          ><mat-option value="updated">Recently updated</mat-option
          ><mat-option value="name">Name A–Z</mat-option
          ><mat-option value="level">Highest level</mat-option></mat-select
        >
      </mat-form-field>
    </div>
  `,
  styles: [
    `
      .assessment-filters__filters {
        display: grid;
        grid-template-columns: minmax(200px, 2fr) repeat(3, minmax(155px, 1fr));
        gap: 12px;
        padding: 20px;
        border-radius: 16px;
        background: var(--mat-sys-surface-container-low);
        border: 1px solid var(--mat-sys-outline-variant);
      }
      mat-form-field {
        width: 100%;
        min-width: 0;
      }
      @media (max-width: 1100px) {
        .assessment-filters__filters {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (max-width: 600px) {
        .assessment-filters__filters {
          grid-template-columns: minmax(0, 1fr);
          padding: 16px;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssessmentTestListFiltersComponent {
  readonly levels = input<number[]>([]);
  readonly query = input('');
  readonly subjectFilter = input<AssessmentTestDto['subject'] | 'ALL'>('ALL');
  readonly levelCap = input<number | null>(null);
  readonly sort = input<'updated' | 'name' | 'level'>('updated');

  readonly queryChange = output<string>();
  readonly subjectFilterChange = output<AssessmentTestDto['subject'] | 'ALL'>();
  readonly levelCapChange = output<number | null>();
  readonly sortChange = output<'updated' | 'name' | 'level'>();
}
