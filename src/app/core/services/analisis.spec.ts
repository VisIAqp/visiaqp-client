import { TestBed } from '@angular/core/testing';

import { AnalisisService } from './analisis';

describe('AnalisisService', () => {
  let service: AnalisisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnalisisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
