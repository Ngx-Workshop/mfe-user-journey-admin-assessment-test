import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AssessmentTestDto } from '@tmdjr/service-nestjs-assessment-test-contracts';
import { AssessmentCatalogViewModel } from './assessment-catalog.view-model';
import { AssessmentTestListAccordionComponent } from './assessment-test-list-accordion.component';
import { AssessmentTestListEmptyStateComponent } from './assessment-test-list-empty-state.component';
import { AssessmentTestListFiltersComponent } from './assessment-test-list-filters.component';

@Component({
  selector: 'ngx-assessment-catalog-view',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressBarModule,
    AssessmentTestListAccordionComponent,
    AssessmentTestListEmptyStateComponent,
    AssessmentTestListFiltersComponent,
  ],
  template: `
    <section
      class="assessment-catalog__layout"
      aria-label="Assessment catalog"
      [attr.aria-busy]="vm().loading()"
    >
      <ngx-assessment-test-list-filters
        [query]="vm().query()"
        [subjectFilter]="vm().subjectFilter()"
        [levelCap]="vm().levelCap()"
        [levels]="vm().levels()"
        [sort]="vm().sort()"
        (queryChange)="queryChange.emit($event)"
        (subjectFilterChange)="subjectChange.emit($event)"
        (levelCapChange)="levelChange.emit($event)"
        (sortChange)="sortChange.emit($event)"
      />
      <div class="assessment-catalog__results-toolbar">
        <p role="status">
          {{ vm().filtered().length }}
          {{ vm().filtered().length === 1 ? 'assessment' : 'assessments' }}
          @if (vm().hasFilters()) {
            <span> of {{ vm().tests().length }}</span>
          }
        </p>
        <div>
          @if (vm().hasFilters()) {
            <button mat-button (click)="clear.emit()">Clear filters</button>
          }
          <button mat-button (click)="refresh.emit()" [disabled]="vm().loading()">
            <mat-icon>refresh</mat-icon>Refresh
          </button>
        </div>
      </div>
      @if (vm().loading()) {
        <mat-progress-bar mode="indeterminate" aria-label="Loading assessments" />
      }
      @if (vm().error()) {
        <div class="assessment-catalog__message assessment-catalog__error" role="alert">
          <mat-icon>error_outline</mat-icon>
          <div>
            <strong>We couldn't complete that request</strong>
            <p>{{ vm().error() }}</p>
            <button mat-stroked-button (click)="refresh.emit()" [disabled]="vm().loading()">
              Reload assessments
            </button>
          </div>
        </div>
      }
      @if (vm().tests().length) {
        <ngx-assessment-test-list-accordion
          [tests]="vm().pagedTests()"
          [busy]="vm().loading()"
          (edit)="edit.emit($event)"
          (delete)="delete.emit($event)"
        />
        @if (vm().filtered().length) {
          <mat-paginator
            [length]="vm().filtered().length"
            [pageIndex]="vm().currentPage()"
            [pageSize]="10"
            [hidePageSize]="true"
            [showFirstLastButtons]="true"
            (page)="pageChange.emit($event.pageIndex)"
            aria-label="Assessment list pages"
          />
        }
      }
      @if (vm().loading() && !vm().tests().length) {
        <div class="assessment-catalog__empty" role="status">
          <h3>Loading your assessments…</h3>
          <p>Your library will appear here.</p>
        </div>
      }
      @if (!vm().loading() && !vm().error() && !vm().filtered().length) {
        @if (vm().tests().length) {
          <div class="assessment-catalog__empty" role="status">
            <mat-icon>search_off</mat-icon>
            <h3>No matching assessments</h3>
            <p>Try another search or clear your subject and level filters.</p>
            <button mat-stroked-button (click)="clear.emit()">Clear filters</button>
          </div>
        } @else {
          <ngx-assessment-test-list-empty-state (create)="create.emit()" />
        }
      }
      <p class="assessment-catalog__policy">
        <mat-icon>info_outline</mat-icon>Assessments with learner attempts cannot be changed or
        deleted.
      </p>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .assessment-catalog__layout {
        display: grid;
        gap: 16px;
      }
      .assessment-catalog__results-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        flex-wrap: wrap;
      }
      .assessment-catalog__results-toolbar p {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
      }
      .assessment-catalog__results-toolbar span {
        color: var(--mat-sys-on-surface-variant);
        font-weight: 400;
      }
      .assessment-catalog__empty {
        text-align: center;
        padding: 48px 16px;
        border: 1px dashed var(--mat-sys-outline-variant);
        border-radius: 16px;
      }
      .assessment-catalog__empty h3 {
        margin: 12px 0;
      }
      .assessment-catalog__empty p,
      .assessment-catalog__policy {
        color: var(--mat-sys-on-surface-variant);
      }
      .assessment-catalog__message {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 20px;
        border-radius: 12px;
        background: var(--mat-sys-error-container);
        color: var(--mat-sys-on-error-container);
      }
      .assessment-catalog__message mat-icon {
        flex-shrink: 0;
      }
      .assessment-catalog__message p {
        overflow-wrap: anywhere;
      }
      .assessment-catalog__policy {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        font-size: 12px;
        line-height: 20px;
        margin: 8px 0;
      }
      .assessment-catalog__policy mat-icon {
        font-size: 18px;
        flex-shrink: 0;
      }
      mat-paginator {
        border-radius: 12px;
      }
      @media (max-width: 600px) {
        .assessment-catalog__results-toolbar {
          gap: 4px;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssessmentCatalogViewComponent {
  readonly vm = input.required<AssessmentCatalogViewModel>();
  readonly queryChange = output<string>();
  readonly subjectChange = output<AssessmentTestDto['subject'] | 'ALL'>();
  readonly levelChange = output<number | null>();
  readonly sortChange = output<'updated' | 'name' | 'level'>();
  readonly pageChange = output<number>();
  readonly clear = output<void>();
  readonly refresh = output<void>();
  readonly create = output<void>();
  readonly edit = output<AssessmentTestDto>();
  readonly delete = output<AssessmentTestDto>();
}
