import { TestBed } from '@angular/core/testing';

import { ApiUrlHelperService } from './api-url-helper.service';

describe('ApiUrlHelperService', () => {
  let service: ApiUrlHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiUrlHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
