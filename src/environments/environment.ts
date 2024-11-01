import { Languages } from '@core/types';

export const environment = {
	production: false,
	apiUrl: 'http://localhost:3000/api',
	defaultTitle: 'Angular Template Project',
	defaultLanguage: Languages.English,
	authUserKey: 'X-Dev-Auth-User',
	authJWTKey: 'X-Dev-Auth-Jwt',
	authRefreshKey: 'X-Dev-Auth-Refresh',
	authRememberMeKey: 'X-Dev-Auth-Remember-Me',
	languageKey: 'X-Dev-Language',
	themeKey: 'X-Dev-Theme-UI',
	timeZone: 'America\\Havana',
};
