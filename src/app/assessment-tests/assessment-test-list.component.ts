import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {
  MatSnackBar,
  MatSnackBarModule,
} from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { AssessmentTestDto } from '@tmdjr/service-nestjs-assessment-test-contracts';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { AssessmentTestsApiService } from '../services/assessment-tests-api.service';
import { AssessmentTestCardComponent } from './assessment-test-card.component';

@Component({
  selector: 'ngx-assessment-test-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatTooltipModule,
    AssessmentTestCardComponent,
  ],
  template: `
    <div class="hero">
      <div>
        <p class="eyebrow">Assessments</p>
        <h1>Assessment Tests</h1>
        <p class="lede">
          Build, edit, and manage Angular, NestJS, and RxJS assessment
          tests.
        </p>
      </div>
      <div class="hero-actions">
        <button
          mat-flat-button
          color="primary"
          (click)="openCreate()"
        >
          <mat-icon>add</mat-icon>
          New test
        </button>
        <button mat-stroked-button type="button" (click)="reload()">
          <mat-icon>refresh</mat-icon>
          Refresh
        </button>
      </div>
    </div>

    <div class="controls">
      <mat-form-field appearance="outline" class="search">
        <mat-label>Search</mat-label>
        <input
          matInput
          placeholder="Filter by name or subject"
          [value]="query()"
          (input)="query.set($any($event.target).value)"
        />
        @if(query()) {
        <button
          mat-icon-button
          matSuffix
          (click)="query.set('')"
          aria-label="Clear"
        >
          <mat-icon>close</mat-icon>
        </button>
        }
      </mat-form-field>
    </div>

    @if (loading()) {
    <mat-progress-bar mode="indeterminate"></mat-progress-bar>
    }

    <div class="grid">
      @for (t of filtered(); track t._id) {
      <ngx-assessment-test-card
        [test]="t"
        (edit)="openEdit($event)"
        (remove)="confirmDelete($event)"
      ></ngx-assessment-test-card>
      }
    </div>

    @if (!loading() && filtered().length === 0) {
    <div class="empty">
      <mat-icon>inbox</mat-icon>
      <p>No assessment tests match your filter.</p>
      <button mat-flat-button color="primary" (click)="openCreate()">
        <mat-icon>add</mat-icon>
        Add your first test
      </button>
    </div>
    }
  `,
  styles: [
    `
      .hero {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: flex-start;
        padding: 1.5rem 0 0.5rem;
      }
      .hero h1 {
        margin: 0.25rem 0;
        font-size: 2rem;
      }
      .hero .lede {
        margin: 0;
        opacity: 0.8;
        max-width: 640px;
      }
      .hero-actions {
        display: flex;
        gap: 0.5rem;
      }
      .controls {
        display: flex;
        justify-content: flex-start;
        padding: 0.5rem 0 1rem;
      }
      .search {
        width: min(520px, 100%);
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 1rem;
      }
      .empty {
        display: grid;
        gap: 0.75rem;
        justify-items: center;
        padding: 2rem 0;
        opacity: 0.75;
      }
      .empty mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
      }
      .eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-size: 0.78rem;
        margin: 0;
        color: var(--mat-sys-secondary);
      }
      @media (max-width: 720px) {
        .hero {
          flex-direction: column;
        }
        .hero-actions {
          width: 100%;
          justify-content: flex-start;
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

  readonly tests = signal<AssessmentTestDto[]>([]);
  readonly loading = signal(false);
  readonly query = signal('');
  readonly filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return this.tests();

    return this.tests().filter((t) => {
      const haystack = [t.name, t.subject, String(t.level)].join(' ');
      return haystack.toLowerCase().includes(q);
    });
  });

  constructor() {
    this.reload();
  }

  reload() {
    this.loading.set(true);
    this.api
      .list$()
      .pipe(
        catchError((err) => {
          this.snack.open(
            'Failed to load assessment tests',
            'Dismiss',
            {
              duration: 4000,
            }
          );
          console.error(err);
          return of([] as AssessmentTestDto[]);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((rows) => this.tests.set(rows));
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
    const ok = confirm(`Delete "${test.name}"?`);
    if (!ok) return;

    this.loading.set(true);
    this.api
      .delete$(test._id)
      .pipe(
        catchError((err) => {
          this.snack.open('Failed to delete test', 'Dismiss', {
            duration: 4000,
          });
          console.error(err);
          return of(undefined);
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
}
