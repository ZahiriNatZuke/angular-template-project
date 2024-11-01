import { RouterState } from '@app/core/router-store';
import { RouterReducerState } from '@ngrx/router-store';
import { createFeatureSelector, createSelector } from '@ngrx/store';

export const selectRouterState =
	createFeatureSelector<RouterReducerState<RouterState>>('router');

export const selectData = createSelector(
	selectRouterState,
	router => router?.state?.data
);
