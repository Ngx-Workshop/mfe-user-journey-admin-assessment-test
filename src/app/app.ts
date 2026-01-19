import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxParticleHeader } from '@tmdjr/ngx-shared-headers';

@Component({
  selector: 'ngx-seed-mfe',
  imports: [RouterOutlet, NgxParticleHeader],
  template: `
    <ngx-particle-header>
      <h1>Assessment Tests</h1>
    </ngx-particle-header>
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
    `,
  ],
})
export class App {}

// 👇 **IMPORTANT FOR DYMANIC LOADING**
export default App;
