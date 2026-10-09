import { TestBed } from '@angular/core/testing';

import { Monitoreo } from './monitoreo';

describe('Monitoreo', () => {
  let service: Monitoreo;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Monitoreo);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
