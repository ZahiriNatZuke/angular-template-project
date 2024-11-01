import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { INotifyOptions, Loading, Notify } from 'notiflix';

@Injectable({ providedIn: 'root' })
export class NotifyService {
	readonly #translate = inject(TranslateService);
	#defaultOptions = signal<INotifyOptions>({
		cssAnimationStyle: 'from-right',
		clickToClose: true,
		cssAnimationDuration: 300,
		cssAnimation: true,
		pauseOnHover: true,
		timeout: 2000,
		fontSize: '16px',
	}).asReadonly();

	success(translateKey: string): void {
		Notify.success(
			this.#translate.instant(translateKey),
			this.#defaultOptions()
		);
	}

	info(translateKey: string): void {
		Notify.info(this.#translate.instant(translateKey), this.#defaultOptions());
	}

	warning(translateKey: string): void {
		Notify.warning(
			this.#translate.instant(translateKey),
			this.#defaultOptions()
		);
	}

	loading() {
		Loading.dots({ svgColor: '#fff', backgroundColor: 'rgba(0,0,0,0.5)' });
	}

	removeLoading(delay?: number) {
		Loading.remove(delay);
	}
}
