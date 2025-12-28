import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header.component';

@Component({
  selector: 'ngx-seed-mfe',
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <ngx-assessment-tests-header></ngx-assessment-tests-header>
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
    `,
  ],
})
export class App {}

// 👇 **IMPORTANT FOR DYMANIC LOADING**
export default App;
