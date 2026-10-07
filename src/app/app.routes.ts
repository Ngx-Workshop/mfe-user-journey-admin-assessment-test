import { Route } from '@angular/router';
import App from './app';
import { AssessmentTestListComponent } from './assessment-tests/catalog/assessment-test-list.component';
import { AssessmentTestWizardComponent } from './assessment-tests/wizard/assessment-test-wizard.component';

export const Routes: Route[] = [
  {
    path: '',
    component: App,
    children: [
      { path: '', component: AssessmentTestListComponent },
      {
        path: 'tests/new',
        component: AssessmentTestWizardComponent,
        canDeactivate: [
          (component: AssessmentTestWizardComponent) =>
            component.canLeave(),
        ],
      },
      {
        path: 'tests/:id',
        component: AssessmentTestWizardComponent,
        canDeactivate: [
          (component: AssessmentTestWizardComponent) =>
            component.canLeave(),
        ],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
