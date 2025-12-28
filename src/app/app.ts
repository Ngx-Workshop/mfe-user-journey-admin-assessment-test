import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'ngx-seed-mfe',
  imports: [RouterOutlet],
  template: `
    <main class="shell">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [``],
})
export class App {}

// 👇 **IMPORTANT FOR DYMANIC LOADING**
export default App;
