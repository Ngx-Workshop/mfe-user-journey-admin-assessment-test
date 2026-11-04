import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AssessmentSection } from '../../models/assessment-test';
import { AssessmentTestDto } from '@tmdjr/service-nestjs-assessment-test-contracts';

@Component({
  selector: 'ngx-assessment-test-list-filters',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <div
      class="assessment-filters__filters"
      role="search"
      aria-label="Filter assessments"
    >
      <mat-form-field
        appearance="outline"
        subscriptSizing="dynamic"
        class="assessment-filters__search"
      >
        <mat-label>Find an assessment</mat-label
        ><mat-icon matPrefix>search</mat-icon>
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
        <mat-select panelClass="ngx-design-system-overlay ngx-select-panel"
          [value]="subjectFilter()"
          (selectionChange)="subjectFilterChange.emit($event.value)"
        >
          <mat-option value="ALL">All subjects</mat-option>
          @for (subject of subjects(); track subject._id) {
            <mat-option [value]="subject._id">{{
              subject.sectionTitle
            }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline" subscriptSizing="dynamic"
        ><mat-label>Maximum level</mat-label>
        <mat-select panelClass="ngx-design-system-overlay ngx-select-panel"
          [value]="levelCap() ?? 'ALL'"
          (selectionChange)="
            levelCapChange.emit(
              $event.value === 'ALL' ? null : $event.value
            )
          "
        >
          <mat-option value="ALL">Any level</mat-option>
          @for (level of levels(); track level) {
            <mat-option [value]="level"
              >Level {{ level }} or below</mat-option
            >
          }
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline" subscriptSizing="dynamic"
        ><mat-label>Sort by</mat-label>
        <mat-select panelClass="ngx-design-system-overlay ngx-select-panel"
          [value]="sort()"
          (selectionChange)="sortChange.emit($event.value)"
          ><mat-option value="updated">Recently updated</mat-option
          ><mat-option value="name">Name A–Z</mat-option
          ><mat-option value="level"
            >Highest level</mat-option
          ></mat-select
        >
      </mat-form-field>
    </div>
  `,
  styles: [
    `
      .assessment-filters__filters { display: grid; gap: 16px; padding: 4px 0 12px; }
      mat-form-field { width: 100%; min-width: 0; }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssessmentTestListFiltersComponent {
  readonly subjects = input<readonly AssessmentSection[]>([]);
  readonly levels = input<number[]>([]);
  readonly query = input('');
  readonly subjectFilter = input<
    AssessmentTestDto['subject'] | 'ALL'
  >('ALL');
  readonly levelCap = input<number | null>(null);
  readonly sort = input<'updated' | 'name' | 'level'>('updated');

  readonly queryChange = output<string>();
  readonly subjectFilterChange = output<
    AssessmentTestDto['subject'] | 'ALL'
  >();
  readonly levelCapChange = output<number | null>();
  readonly sortChange = output<'updated' | 'name' | 'level'>();
}
