import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { APP_LINKS } from '@core/utils/app-links';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
	selector: 'app-home-page',
	templateUrl: './home.page.html',
	imports: [TranslatePipe],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
	repoUrl = signal(APP_LINKS.repo);
	docsUrl = signal(APP_LINKS.docs);
}
