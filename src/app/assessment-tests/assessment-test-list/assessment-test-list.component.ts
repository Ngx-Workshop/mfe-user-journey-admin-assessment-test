import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {
  MatSnackBar,
  MatSnackBarModule,
} from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AssessmentTestDto } from '@tmdjr/service-nestjs-assessment-test-contracts';
import { EMPTY } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { apiError } from '../../services/api-error';
import { AssessmentTestsApiService } from '../../services/assessment-tests-api.service';
import { AssessmentTestListAccordionComponent } from './assessment-test-list-accordion.component';
import { AssessmentTestListEmptyStateComponent } from './assessment-test-list-empty-state.component';
import { AssessmentTestListFiltersComponent } from './assessment-test-list-filters.component';

@Component({
  selector: 'ngx-assessment-test-list',
  imports: [
    MatProgressBarModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatIconModule,
    MatButtonModule,
    AssessmentTestListFiltersComponent,
    AssessmentTestListAccordionComponent,
    AssessmentTestListEmptyStateComponent,
  ],
  template: `
    <section
      class="layout"
      aria-labelledby="catalog-title"
      [attr.aria-busy]="loading()"
    >
      <header class="catalog-header">
        <div>
          <p class="eyebrow">ASSESSMENT LIBRARY</p>
          <h2 id="catalog-title">Your assessments</h2>
          <p class="intro">
            Find, review and refine the tests in your learning
            journey.
          </p>
        </div>
        <button mat-flat-button (click)="openCreate()">
          <mat-icon>add</mat-icon>Create assessment
        </button>
      </header>
      <ngx-assessment-test-list-filters
        [query]="query()"
        [subjectFilter]="subjectFilter()"
        [levelCap]="levelCap()"
        [levels]="levels()"
        [sort]="sort()"
        (queryChange)="query.set($event); pageIndex.set(0)"
        (subjectFilterChange)="
          subjectFilter.set($event); pageIndex.set(0)
        "
        (levelCapChange)="onLevelCapChange($event)"
        (sortChange)="sort.set($event); pageIndex.set(0)"
      />
      <div class="results-toolbar">
        <p role="status">
          {{ filtered().length }}
          {{
            filtered().length === 1 ? 'assessment' : 'assessments'
          }}@if (hasFilters()) {<span> of {{ tests().length }}</span
          >}
        </p>
        <div>
          @if (hasFilters()) {
          <button mat-button (click)="clearFilters()">
            Clear filters
          </button>
          }
          <button
            mat-button
            (click)="reload()"
            [disabled]="loading()"
          >
            <mat-icon>refresh</mat-icon>Refresh
          </button>
        </div>
      </div>
      @if (loading()) {
      <mat-progress-bar
        mode="indeterminate"
        aria-label="Loading assessments"
      />
      } @if (error()) {
      <div class="message error" role="alert">
        <mat-icon>error_outline</mat-icon>
        <div>
          <strong>We couldn't complete that request</strong>
          <p>{{ error() }}</p>
          <button
            mat-stroked-button
            (click)="reload()"
            [disabled]="loading()"
          >
            Reload assessments
          </button>
        </div>
      </div>
      } @if (tests().length) {
      <ngx-assessment-test-list-accordion
        [tests]="pagedTests()"
        [busy]="loading()"
        (edit)="openEdit($event)"
        (delete)="confirmDelete($event)"
      />
      @if (filtered().length) {
      <mat-paginator
        [length]="filtered().length"
        [pageIndex]="currentPage()"
        [pageSize]="10"
        [hidePageSize]="true"
        [showFirstLastButtons]="true"
        (page)="pageIndex.set($event.pageIndex)"
        aria-label="Assessment list pages"
      />
      } } @if (loading() && !tests().length) {
      <div class="empty" role="status">
        <h3>Loading your assessments…</h3>
        <p>Your library will appear here.</p>
      </div>
      } @if (!loading() && !error() && !filtered().length) { @if
      (tests().length) {
      <div class="empty" role="status">
        <mat-icon>search_off</mat-icon>
        <h3>No matching assessments</h3>
        <p>
          Try another search or clear your subject and level filters.
        </p>
        <button mat-stroked-button (click)="clearFilters()">
          Clear filters
        </button>
      </div>
      } @else {
      <ngx-assessment-test-list-empty-state (create)="openCreate()" />
      } }
      <p class="policy">
        <mat-icon>info_outline</mat-icon>Assessments with learner
        attempts cannot be changed or deleted.
      </p>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .layout {
        display: grid;
        gap: 16px;
        padding: 16px 0;
      }
      .catalog-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
        margin-bottom: 8px;
      }
      .eyebrow {
        margin: 0 0 6px;
        font-size: 11px;
        letter-spacing: 0.1em;
        font-weight: 700;
        color: var(--mat-sys-primary);
      }
      h2 {
        font-size: clamp(26px, 3vw, 34px);
        margin: 0;
        letter-spacing: -0.03em;
      }
      .intro {
        color: var(--mat-sys-on-surface-variant);
        margin: 10px 0 0;
        line-height: 1.5;
      }
      .catalog-header button {
        flex-shrink: 0;
      }
      .results-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        flex-wrap: wrap;
      }
      .results-toolbar p {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
      }
      .results-toolbar span {
        color: var(--mat-sys-on-surface-variant);
        font-weight: 400;
      }
      .empty {
        text-align: center;
        padding: 48px 16px;
        border: 1px dashed var(--mat-sys-outline-variant);
        border-radius: 16px;
      }
      .empty h3 {
        margin: 12px 0;
      }
      .empty p,
      .policy {
        color: var(--mat-sys-on-surface-variant);
      }
      .message {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 20px;
        border-radius: 12px;
        background: var(--mat-sys-error-container);
        color: var(--mat-sys-on-error-container);
      }
      .message mat-icon {
        flex-shrink: 0;
      }
      .message p {
        overflow-wrap: anywhere;
      }
      .policy {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        font-size: 12px;
        line-height: 20px;
        margin: 8px 0;
      }
      .policy mat-icon {
        font-size: 18px;
        flex-shrink: 0;
      }
      mat-paginator {
        border-radius: 12px;
      }
      @media (max-width: 600px) {
        .catalog-header {
          align-items: flex-start;
          flex-direction: column;
          gap: 16px;
        }
        .results-toolbar {
          gap: 4px;
        }
      }
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

  readonly pageIndex = signal(0);
  readonly currentPage = computed(() =>
    Math.min(
      this.pageIndex(),
      Math.max(0, Math.ceil(this.filtered().length / 10) - 1)
    )
  );
  readonly pagedTests = computed(() =>
    this.filtered().slice(
      this.currentPage() * 10,
      this.currentPage() * 10 + 10
    )
  );
  readonly levels = computed(() =>
    [...new Set(this.tests().map((test) => test.level))].sort(
      (a, b) => a - b
    )
  );
  readonly hasFilters = computed(
    () =>
      !!this.query().trim() ||
      this.subjectFilter() !== 'ALL' ||
      this.levelCap() !== null
  );

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
    this.pageIndex.set(0);
    if (value === null) {
      this.levelCap.set(null);
      return;
    }
    if (!Number.isNaN(value) && value > 0) {
      this.levelCap.set(value);
    }
  }

  clearFilters() {
    this.pageIndex.set(0);
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
