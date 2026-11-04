import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { NgxActionBar, NgxButton } from '@tmdjr/ngx-workshop-design-system';

@Component({
  selector: 'ngx-seed-mfe',
  host: { class: 'assessment-shell ngx-design-system' },
  imports: [RouterOutlet, RouterLink, MatIconModule, MatButtonModule, NgxActionBar, NgxButton],
  template: `
    <ngx-action-bar heading="Assessment tests">
      @if (editing()) {
        <a mat-button ngxButton surface="outline" [routerLink]="['.']" aria-label="All assessments">
          <mat-icon>arrow_back</mat-icon><span>All assessments</span>
        </a>
      } @else {
        <a mat-flat-button ngxButton surface="outline" shape="chevron" [routerLink]="['tests', 'new']" aria-label="Create Assessment">
          <mat-icon>add</mat-icon><span>Create Assessment</span>
        </a>
      }
    </ngx-action-bar>
    <div class="assessment-shell__content"><router-outlet /></div>
  `,
  styles: [`
    :host { display: block; min-width: 0; background: var(--ngx-color-canvas); color: var(--ngx-color-text); }
    ngx-action-bar { --ngx-action-bar-top: var(--assessment-toolbar-top, 96px); }
    .assessment-shell__content { padding: 1rem; min-width: 0; }
    @media (max-width: 720px) {
      ngx-action-bar { --ngx-action-bar-top: var(--assessment-toolbar-top, 76px); }
      .assessment-shell__content { padding: 0.5rem; }
      a[ngxButton] { min-width: 0; font-size: 0.7rem; padding-inline: 8px; }
    }
    @media (max-width: 420px) { a span { display: none; } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly router = inject(Router);
  protected readonly editing = computed(() => this.router.lastSuccessfulNavigation()?.finalUrl?.toString().includes('/tests/') ?? false);
}
export default App;
