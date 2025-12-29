import { Route } from '@angular/router';
import App from './app';
import { AssessmentTestListComponent } from './assessment-tests/assessment-test-list/assessment-test-list.component';
import { AssessmentTestWizardComponent } from './assessment-tests/assessment-test-wizard.component';

export const Routes: Route[] = [
  {
    path: '',
    component: App,
    children: [
      { path: '', component: AssessmentTestListComponent },
      { path: 'tests/new', component: AssessmentTestWizardComponent },
      { path: 'tests/:id', component: AssessmentTestWizardComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];
