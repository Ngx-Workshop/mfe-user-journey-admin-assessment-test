import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {
  MatSnackBar,
  MatSnackBarModule,
} from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AssessmentTestDto } from '@tmdjr/service-nestjs-assessment-test-contracts';
import { EMPTY } from 'rxjs';
import { apiError } from '../../services/api-error';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { catchError, finalize } from 'rxjs/operators';
import { AssessmentTestsApiService } from '../../services/assessment-tests-api.service';
import { AssessmentTestListAccordionComponent } from './assessment-test-list-accordion.component';
import { AssessmentTestListEmptyStateComponent } from './assessment-test-list-empty-state.component';
import { AssessmentTestListFiltersComponent } from './assessment-test-list-filters.component';

@Component({
  selector: 'ngx-assessment-test-list',
  imports: [
    MatProgressBarModule,
    MatSnackBarModule,
    MatIconModule,
    MatButtonModule,
    AssessmentTestListFiltersComponent,
    AssessmentTestListAccordionComponent,
    AssessmentTestListEmptyStateComponent,
  ],
  template: `
    <div class="layout">
      <ngx-assessment-test-list-filters
        [query]="query()"
        [subjectFilter]="subjectFilter()"
        [levelCap]="levelCap()"
        [sort]="sort()"
        (queryChange)="query.set($event)"
        (subjectFilterChange)="subjectFilter.set($event)"
        (levelCapChange)="onLevelCapChange($event)"
        (sortChange)="sort.set($event)"
        (clear)="clearFilters()"
      ></ngx-assessment-test-list-filters>

      @if (loading()) {
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      }

      @if (error()) {
        <div role="alert">
          <p>{{ error() }}</p>
          <button
            mat-stroked-button
            (click)="reload()"
            [disabled]="loading()"
          >
            Retry
          </button>
        </div>
      }
      <ngx-assessment-test-list-accordion
        [tests]="filtered()"
        [busy]="loading()"
        (refresh)="reload()"
        [filteredCount]="filtered().length"
        [totalCount]="tests().length"
        [subjectFilter]="subjectFilter()"
        [levelCap]="levelCap()"
        (edit)="openEdit($event)"
        (delete)="confirmDelete($event)"
      ></ngx-assessment-test-list-accordion>

      @if (!loading() && !error() && filtered().length === 0) {
        @if (tests().length) {
          <div class="empty" role="status">
            <p>No tests match these filters.</p>
            <button mat-stroked-button (click)="clearFilters()">
              Clear filters
            </button>
          </div>
        } @else {
          <ngx-assessment-test-list-empty-state
            (create)="openCreate()"
          ></ngx-assessment-test-list-empty-state>
        }
      }
    </div>

    <!-- <button matFab class="add-fab" (click)="openCreate()">
      <mat-icon>add</mat-icon>
    </button> -->
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .layout {
        display: grid;
        gap: 0.75rem;
      }
      // button[matFab] {
      //   position: fixed;
      //   bottom: 48px;
      //   right: 20px;
      //   z-index: 1000;
      // }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssessmentTestListComponent {
  private readonly api = inject(AssessmentTestsApiService);
  private readonly snack = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly destroyRef = inject(DestroyRef);
  readonly error = signal<string | null>(null);
  readonly tests = signal<AssessmentTestDto[]>([]);
  readonly loading = signal(false);
  readonly query = signal('');
  readonly subjectFilter = signal<
    AssessmentTestDto['subject'] | 'ALL'
  >('ALL');
  readonly levelCap = signal<number | null>(null);
  readonly sort = signal<'updated' | 'name' | 'level'>('updated');
  readonly filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    const subject = this.subjectFilter();
    const levelCap = this.levelCap();

    let rows = this.tests();

    if (subject !== 'ALL') {
      rows = rows.filter((t) => t.subject === subject);
    }

    if (levelCap !== null) {
      rows = rows.filter((t) => t.level <= levelCap);
    }

    if (q) {
      rows = rows.filter((t) => {
        const haystack = [t.name, t.subject, String(t.level)].join(
          ' '
        );
        return haystack.toLowerCase().includes(q);
      });
    }

    return this.sortRows(rows);
  });

  constructor() {
    this.reload();
  }

  reload() {
    if (this.loading()) return;
    this.error.set(null);
    this.loading.set(true);
    this.api
      .list$()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (rows) => this.tests.set(rows),
        error: (error) =>
          this.error.set(
            apiError(
              error,
              'Could not load assessment tests. Please retry.'
            )
          ),
      });
  }

  onLevelCapChange(value: number | null) {
    if (value === null) {
      this.levelCap.set(null);
      return;
    }
    if (!Number.isNaN(value) && value > 0) {
      this.levelCap.set(value);
    }
  }

  clearFilters() {
    this.query.set('');
    this.subjectFilter.set('ALL');
    this.levelCap.set(null);
    this.sort.set('updated');
  }

  openCreate() {
    this.router.navigate(['tests', 'new'], {
      relativeTo: this.route,
    });
  }

  openEdit(test: AssessmentTestDto) {
    this.router.navigate(['tests', test._id], {
      relativeTo: this.route,
    });
  }

  confirmDelete(test: AssessmentTestDto) {
    if (this.loading()) return;
    const ok = confirm(`Delete "${test.name}"?`);
    if (!ok) return;

    this.error.set(null);
    this.loading.set(true);
    this.api
      .delete$(test._id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((err) => {
          this.error.set(
            apiError(err, 'Could not delete this test. Please retry.')
          );
          return EMPTY;
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe(() => {
        this.tests.set(
          this.tests().filter((t) => t._id !== test._id)
        );
        this.snack.open('Test deleted', undefined, {
          duration: 2000,
        });
      });
  }

  private sortRows(rows: AssessmentTestDto[]): AssessmentTestDto[] {
    const order = this.sort();

    if (order === 'name') {
      return [...rows].sort((a, b) => a.name.localeCompare(b.name));
    }

    if (order === 'level') {
      return [...rows].sort((a, b) => b.level - a.level);
    }

    return [...rows].sort(
      (a, b) =>
        new Date(b.lastUpdated).getTime() -
        new Date(a.lastUpdated).getTime()
    );
  }
}
