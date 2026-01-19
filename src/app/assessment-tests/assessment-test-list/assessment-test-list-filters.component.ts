
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AssessmentTestDto } from '@tmdjr/service-nestjs-assessment-test-contracts';

@Component({
  selector: 'ngx-assessment-test-list-filters',
  imports: [
    MatButtonModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule
],
  template: `
    <div class="filters">
      <div class="filter-row header">
        <h3>Filters</h3>
        <button matButton (click)="clear.emit()">
          <mat-icon>clear_all</mat-icon> Clear All
        </button>
      </div>
      <div class="filter-row">
        <mat-form-field appearance="outline" class="search-bar">
          <mat-label>Search</mat-label>
          <input
            matInput
            placeholder="Filter by name or subject"
            [value]="query()"
            (input)="queryChange.emit($any($event.target).value)"
          />
          @if(query()) {
          <button
            mat-icon-button
            matSuffix
            (click)="queryChange.emit('')"
          >
            <mat-icon>close</mat-icon>
          </button>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="subject">
          <mat-label>Subject</mat-label>
          <mat-select
            [value]="subjectFilter()"
            (selectionChange)="
              subjectFilterChange.emit($any($event.value))
            "
          >
            <mat-option value="ALL">All</mat-option>
            <mat-option value="ANGULAR">Angular</mat-option>
            <mat-option value="NESTJS">NestJS</mat-option>
            <mat-option value="RXJS">RxJS</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
      <div class="filter-row">
        <mat-form-field appearance="outline" class="level">
          <mat-label>Max level</mat-label>
          <input
            matInput
            type="number"
            min="1"
            [value]="levelCap() ?? ''"
            (input)="onLevelCapInput($any($event.target).value)"
          />
          @if(levelCap() !== null) {
          <button
            mat-icon-button
            matSuffix
            (click)="levelCapChange.emit(null)"
          >
            <mat-icon>close</mat-icon>
          </button>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="sort">
          <mat-label>Sort</mat-label>
          <mat-select
            [value]="sort()"
            (selectionChange)="sortChange.emit($any($event.value))"
          >
            <mat-option value="updated">Recently updated</mat-option>
            <mat-option value="name">Name A→Z</mat-option>
            <mat-option value="level">Level high→low</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
    </div>
  `,
  styles: [
    `
      .filters {
        background: var(--mat-sys-surface-container-low);
        padding: 1.5rem;
        border-radius: var(
          --mat-card-elevated-container-shape,
          var(--mat-sys-corner-medium)
        );
        margin-bottom: 2rem;
        h3 {
          margin-top: 0;
          margin-bottom: 1rem;
        }
      }
      .filter-row {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        align-items: center;
        margin-bottom: 1rem;

        &.header {
          justify-content: space-between;
        }
        &:last-child {
          margin-bottom: 0;
        }
        .level {
          width: 140px;
        }
        .sort {
          width: 180px;
        }
      }

      .search-bar {
        width: 100%;
        max-width: 600px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssessmentTestListFiltersComponent {
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
  readonly clear = output<void>();

  onLevelCapInput(raw: string) {
    const value = Number(raw);
    if (!raw) {
      this.levelCapChange.emit(null);
      return;
    }
    if (!Number.isNaN(value) && value > 0) {
      this.levelCapChange.emit(value);
    }
  }
}
