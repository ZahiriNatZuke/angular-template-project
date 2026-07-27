import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthStore } from '@core/stores/auth.store';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
	selector: 'app-dashboard-page',
	templateUrl: './dashboard.page.html',
	imports: [TranslatePipe],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
	authStore = inject(AuthStore);

	logout(): void {
		this.authStore.logout();
	}
}
