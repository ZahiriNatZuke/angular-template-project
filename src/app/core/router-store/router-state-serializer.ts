import { RouterStateSnapshot } from '@angular/router';
import {
	RouterState,
	mergeRouteData,
	mergeRouteParams,
} from '@app/core/router-store';
import { RouterStateSerializer } from '@ngrx/router-store';

export class CustomRouterStateSerializer
	implements RouterStateSerializer<RouterState>
{
	serialize = (state: RouterStateSnapshot): RouterState => ({
		url: state.url,
		params: mergeRouteParams(state.root, ({ params }) => params),
		queryParams: mergeRouteParams(state.root, ({ queryParams }) => queryParams),
		data: mergeRouteData(state.root),
	});
}
