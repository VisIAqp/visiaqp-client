import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Zonas } from './zonas';
describe('Zonas', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      imports: [Zonas],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
  });
  it('starts without fabricated records and surfaces API failure', () => {
    const fixture = TestBed.createComponent(Zonas);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    const requests = http.match(() => true);
    expect(requests.length).toBeGreaterThan(0);
    for (const req of requests)
      if (!req.cancelled)
        req.flush({ detail: 'Servidor no disponible' }, { status: 503, statusText: 'Unavailable' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('El servidor no pudo completar');
    expect(fixture.nativeElement.textContent).not.toContain('Zona de Prueba');
    fixture.destroy();
    http.verify({ ignoreCancelled: true });
  });
});
