import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ZonaService } from './zona';
describe('ZonaService', () => {
  it('creates an HTTP service without seeding data', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expect(TestBed.inject(ZonaService)).toBeTruthy();
  });
});
