import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { NgxParticleHeader } from '@tmdjr/ngx-shared-headers';

@Component({
  selector: 'ngx-seed-mfe',
  imports: [
    RouterOutlet,
    NgxParticleHeader,
    MatIconModule,
    MatButtonModule,
    RouterLink,
  ],
  template: `
    @if (editing()) {
      <ngx-particle-header>
        <h1>Assessment Tests</h1>
      </ngx-particle-header>
      <div class="assessment-shell__action-bar">
        <a matButton="filled" [routerLink]="['.']"
          ><mat-icon>arrow_back</mat-icon>All assessments</a
        >
      </div>
    } @else {
      <header class="assessment-shell__header-background">
        <div class="assessment-shell__header-section">
          <div class="assessment-shell__header-headline">
            <h1>Assessment-Tests</h1>
            <h2>
              Find, review and refine the tests in for learners'
              learning journey.
            </h2>
          </div>
          <div class="assessment-shell__header-start">
            <a matButton="elevated" [routerLink]="['tests', 'new']"
              ><mat-icon>add</mat-icon>Create Assessment</a
            >
          </div>
        </div>
      </header>
    }

    <div class="assessment-shell__shell">
      <div class="assessment-shell__container">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      .assessment-shell__shell {
        display: flex;
        justify-content: center;
      }
      .assessment-shell__container {
        padding: 28px 0 64px;
        flex: 0 1 clamp(480px, 70vw, 1400px);
        max-width: 100%;
        min-width: 0;
        box-sizing: border-box;
      }
      h1 {
        font-size: 1.85rem;
        font-weight: 100;
        margin: 1.7rem 1rem;
      }
      .assessment-shell__action-bar {
        position: sticky;
        top: 56px;
        height: 56px;
        z-index: 5;
        display: flex;
        flex-direction: row;
        width: 100%;
        background: var(--mat-sys-primary);
        align-items: center;
        a,
        button {
          color: var(--mat-sys-on-primary);
          background: var(--mat-sys-primary);
          margin: 0 12px;
        }
      }
      .assessment-shell__header-background {
        background-color: var(--mat-sys-primary);
      }

      .assessment-shell__header-headline {
        color: var(--mat-sys-secondary-container);
      }

      .assessment-shell__header-start {
        color: var(--mat-sys-primary-container);
      }

      .assessment-shell__header-background {
        overflow: hidden;
        position: relative;
        height: 420px;
      }

      .assessment-shell__header-background::before {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background-image: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="%23e3e3e3"><path d="M480-120 200-272v-240L40-600l440-240 440 240v320h-80v-276l-80 44v240L480-120Zm0-332 274-148-274-148-274 148 274 148Zm0 241 200-108v-151L480-360 280-470v151l200 108Zm0-241Zm0 90Zm0 0Z"/></svg>');
        background-size: 400px;
        background-repeat: no-repeat;
        background-position: 75% 20px;
        opacity: 0.4;
      }

      .assessment-shell__header-section {
        display: flex;
        justify-content: center;
        flex-direction: column;
        align-items: center;
        height: 100%;
        text-align: center;
        position: relative;
      }

      .assessment-shell__header-headline {
        h1 {
          font-size: 7rem;
          font-weight: bold;
          line-height: 5.6rem;
          margin: 15px 5px;
        }

        h2 {
          font-size: 1.4rem;
          font-weight: 100;
          line-height: 28px;
          margin: 15px 0 25px 0;
        }
      }

      .assessment-shell__header-start {
        text-align: center;
        margin: 15px 0 0 0;
        .mat-mdc-raised-button {
          font-size: 15px;
        }
      }
    `,
  ],
})
export class App {
  private readonly router = inject(Router);

  protected readonly editing = computed(
    () =>
      this.router
        .lastSuccessfulNavigation()
        ?.finalUrl?.toString()
        .includes('/tests/') ?? false
  );
}

// 👇 **IMPORTANT FOR DYMANIC LOADING**
export default App;
