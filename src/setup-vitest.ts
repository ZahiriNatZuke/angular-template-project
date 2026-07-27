import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

/**
 * Inicializa el TestBed de Angular una sola vez para toda la suite.
 *
 * `zoneless: true` es obligatorio en este proyecto: no hay `zone.js` entre las
 * dependencias, por lo que el setup basado en zonas de `@analogjs/vitest-angular`
 * no es utilizable aquí.
 */
setupTestBed({ zoneless: true });
