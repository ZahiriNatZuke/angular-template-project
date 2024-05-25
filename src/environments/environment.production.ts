import { Languages } from '@core/types/enums';

export const environment = {
  production: true,
  apiUrl: 'https://api.example.com/api',
  defaultTitle: 'Angular Template Project',
  defaultLanguage: Languages.English,
  authUserKey: 'X-Auth-User',
  authJWTKey: 'X-Auth-Jwt',
  authRefreshKey: 'X-Auth-Refresh',
  authRememberMeKey: 'X-Auth-Remember-Me',
  languageKey: 'X-Language',
  themeKey: 'X-Theme-UI',
};
