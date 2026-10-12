import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MonitoreoService } from './monitoreo';
describe('MonitoreoService', () => {
  it('creates an HTTP service without seeding data', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expect(TestBed.inject(MonitoreoService)).toBeTruthy();
  });
});
