import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from '@app/app.component';
import { appConfig } from '@app/app.config';

bootstrapApplication(AppComponent, appConfig)
	.then(() =>
		console.log('[Bootstrap] Application has been successfully started! 🚀')
	)
	.catch(err => console.error(err));
