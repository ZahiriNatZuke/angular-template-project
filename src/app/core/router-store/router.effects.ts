import { Injectable, inject } from '@angular/core';
import { selectData } from '@app/core/router-store';
import { SeoService } from '@app/core/services';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatLatestFrom } from '@ngrx/operators';
import { routerNavigatedAction } from '@ngrx/router-store';
import { Store } from '@ngrx/store';
import { map, tap } from 'rxjs/operators';

@Injectable()
export class RouterEffects {
	#actions = inject(Actions);
	#store = inject(Store);
	#seo = inject(SeoService);

	updateTitle$ = createEffect(
		() =>
			this.#actions.pipe(
				ofType(routerNavigatedAction),
				concatLatestFrom(() => this.#store.select(selectData)),
				map(([, data]: [any, any]) => data.title),
				tap(title => this.#seo.setTitle(title))
			),
		{ dispatch: false }
	);

	updateMetaDescription$ = createEffect(
		() =>
			this.#actions.pipe(
				ofType(routerNavigatedAction),
				concatLatestFrom(() => this.#store.select(selectData)),
				map(([, data]: [any, any]) => data.description),
				tap(description =>
					this.#seo.updateTag({ name: 'description', content: description })
				)
			),
		{ dispatch: false }
	);
}
