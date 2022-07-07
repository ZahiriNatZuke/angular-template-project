import { TestBed } from '@angular/core/testing';

import { NotificationsInterceptor } from './notifications.interceptor';

describe('NotificationsInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      NotificationsInterceptor
    ]
  }));

  it('should be created', () => {
    const interceptor: NotificationsInterceptor = TestBed.inject(NotificationsInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
