import { ActivatedRouteSnapshot, Data, Params } from '@angular/router';

export const mergeRouteParams = (
	route: ActivatedRouteSnapshot,
	getter: (activatedRoute: ActivatedRouteSnapshot) => Params
): Params =>
	!route
		? {}
		: {
				...getter(route),
				...mergeRouteParams(
					(route.children.find(({ outlet }) => outlet === 'primary') ||
						route.firstChild) as ActivatedRouteSnapshot,
					getter
				),
			};

export const mergeRouteData = (route: ActivatedRouteSnapshot): Data =>
	!route
		? {}
		: {
				...route.data,
				...mergeRouteData(
					(route.children.find(({ outlet }) => outlet === 'primary') ||
						route.firstChild) as ActivatedRouteSnapshot
				),
			};
