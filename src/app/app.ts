import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
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
    <ngx-particle-header>
      <h1>Assessment Tests</h1>
    </ngx-particle-header>
    <div class="action-bar">
      <a matButton="filled" [routerLink]="lastRouteURL()">
        <mat-icon>arrow_back</mat-icon> Back to
        {{ lastRouteName() }}</a
      >
      <div class="flex-spacer"></div>
      <button matButton="filled" (click)="openCreate()">
        <mat-icon>note_add</mat-icon>
        Create New Test
      </button>
    </div>
    <div class="shell">
      <div class="container">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [
    `
      .shell {
        display: flex;
        justify-content: center;
      }
      .container {
        padding: 1rem;
        flex: 0 1 clamp(480px, 70vw, 1400px);
        max-width: 100%;
      }
      h1 {
        font-size: 1.85rem;
        font-weight: 100;
        margin: 1.7rem 1rem;
      }
      .action-bar {
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
    `,
  ],
})
export class App {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly lastRouteURL = computed(
    () =>
      this.router
        .lastSuccessfulNavigation()
        ?.previousNavigation?.extractedUrl.toString() ??
      '/admin-dashboard'
  );

  protected readonly lastRouteName = computed(
    () =>
      this.router
        .lastSuccessfulNavigation()
        ?.previousNavigation?.extractedUrl.toString()
        .split('/')[1]
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase()) || 'Admin Dashboard'
  );

  openCreate() {
    this.router.navigate(['tests', 'new'], {
      relativeTo: this.route,
    });
  }
}

// 👇 **IMPORTANT FOR DYMANIC LOADING**
export default App;
