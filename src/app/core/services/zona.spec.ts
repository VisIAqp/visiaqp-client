import { TestBed } from '@angular/core/testing';

import { ZonaService } from './zona';

describe('ZonaService', () => {
  let service: ZonaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ZonaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
