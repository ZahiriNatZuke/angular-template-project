import { Data, Params } from '@angular/router';

export * from './router.utils';
export * from './router.selectors';
export * from './router-state-serializer';
export * from './router.effects';

export interface RouterState {
	url: string;
	queryParams: Params;
	params: Params;
	data: Data;
}
