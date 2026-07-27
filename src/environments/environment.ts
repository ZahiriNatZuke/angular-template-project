import { Languages } from '@core/types/enums/languages';

export const environment = {
	production: false,
	apiUrl: 'http://localhost:3000/api',
	defaultTitle: 'Angular Template Project',
	defaultLanguage: Languages.English,
	languageKey: 'X-Dev-Language',
	themeKey: 'X-Dev-Theme-UI',
	timeZone: 'America/Havana',
};
