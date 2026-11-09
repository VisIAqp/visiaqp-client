import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AnalisisService } from '../../core/services/analisis';
import { Procesamiento } from '../../core/models/analisis.model';
import { Analisis } from './analisis';
describe('Analisis', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      imports: [Analisis],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
  });
  const filas = (cantidad: number): Procesamiento[] => Array.from({ length: cantidad }, (_, i) => ({
    id: i + 1, zonaId: 1, camaraId: 1, usuarioId: null, tipoFuente: 'video', rutaArchivo: null,
    fechaCapturaInicio: new Date(), fechaInicioProceso: new Date(), fechaFinProceso: null,
    estado: 'completado', mensajeError: null,
  }));
  it('permite recorrer todo el historial cargado sin duplicar filas entre páginas', () => {
    const f = TestBed.createComponent(Analisis);
    const c = f.componentInstance;
    c.procesamientos = filas(23);
    expect(c.paginasEjecuciones).toBe(3);
    expect(c.ejecucionesVisibles.map((r) => r.id)).toEqual([1,2,3,4,5,6,7,8,9,10]);
    c.cambiarPagina(1);
    expect(c.ejecucionesVisibles.map((r) => r.id)).toEqual([11,12,13,14,15,16,17,18,19,20]);
    c.cambiarPagina(1);
    expect(c.ejecucionesVisibles.map((r) => r.id)).toEqual([21,22,23]);
    c.cambiarPagina(1);
    expect(c.paginaEjecuciones).toBe(3);
    f.destroy();
  });
  it('conserva la página al actualizar, ajusta páginas eliminadas y reinicia al filtrar', () => {
    const f = TestBed.createComponent(Analisis);
    const c = f.componentInstance;
    const api = spyOn(TestBed.inject(AnalisisService), 'listar').and.returnValue(of(filas(23)));
    c.paginaEjecuciones = 3;
    c.refrescar();
    expect(c.paginaEjecuciones).toBe(3);
    api.and.returnValue(of(filas(11)));
    c.refrescar();
    expect(c.paginaEjecuciones).toBe(2);
    c.filtroCamara = 8;
    c.refrescar(true);
    expect(c.paginaEjecuciones).toBe(1);
    expect(api).toHaveBeenCalledWith(undefined, 8);
    api.and.returnValue(of([]));
    c.refrescar();
    expect(c.paginasEjecuciones).toBe(1);
    expect(c.ejecucionesVisibles).toEqual([]);
    f.destroy();
  });
  it('starts without fabricated records and surfaces API failure', () => {
    const fixture = TestBed.createComponent(Analisis);
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
