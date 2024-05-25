import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .then(() => console.log('[Bootstrap] Application has been successfully started! 🚀'))
  .catch((err) => console.error(err));
