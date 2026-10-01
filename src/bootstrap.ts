import { bootstrapApplication } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
@Component({
  selector: 'ngx-seed-mfe',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
class StandaloneRoot {}
import { appConfig } from './app/app.config';

bootstrapApplication(StandaloneRoot, appConfig).catch((error) => {
  console.error(error);
});
