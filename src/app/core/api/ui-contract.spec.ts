import { IndicatorQuery } from './indicator-query';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Auth } from '../auth/auth';
import { Dashboard } from '../../pages/dashboard/dashboard';
import { Camaras } from '../../pages/camaras/camaras';
import { Analisis } from '../../pages/analisis/analisis';
import { Reportes } from '../../pages/reportes/reportes';
import { Procesamiento } from '../models/analisis.model';

const base = 'http://localhost:8000/api';
const zone = {
  id_zona: 23,
  nombre: 'Zona contrato',
  descripcion: null,
  ubicacion: null,
  pais: 'PE',
  latitud: null,
  longitud: null,
  estado: 'activa',
};
const camera = {
  id_camara: 42,
  id_zona: 23,
  nombre: 'Cámara contrato',
  tipo: 'fija',
  estado: 'activa',
  intervalo_muestreo_seg: 60,
  zone_polygon: [
    [0, 0],
    [1, 0],
    [1, 1],
  ],
  ultima_conexion: null,
  tiene_url_stream: true,
};
const identity = {
  id_usuario: 7,
  nombres: 'Contrato',
  apellidos: 'HTTP',
  username: 'test',
  email: 'test@example.invalid',
  estado: 'activo',
};

describe('Integrated page behavior with HTTP test responses', () => {
  let http: HttpTestingController;
  let auth: Auth;
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      imports: [Dashboard, Camaras, Analisis, Reportes],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        IndicatorQuery,
      ],
    });
    http = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(Auth);
    auth.user.set(identity);
  });
  afterEach(() => {
    auth.clear();
    http.verify({ ignoreCancelled: true });
  });
  function role(value: string) {
    auth.token.set(
      'header.' +
        btoa(JSON.stringify({ sub: '7', rol: value, exp: Math.floor(Date.now() / 1000) + 3600 })) +
        '.test-signature',
    );
  }

  it('selects the returned zone rather than assuming a fabricated ID', () => {
    const fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();
    http.expectOne(base + '/zonas').flush([zone]);
    http.expectOne(base + '/admin/camaras').flush([camera]);
    http.expectOne((r) => r.url === base + '/procesamientos').flush([]);
    const query = http.expectOne((r) => r.url === base + '/indicadores');
    expect(query.request.params.get('id_zona')).toBe('23');
    query.flush([]);
    fixture.detectChanges();
    expect(fixture.componentInstance.zonaSeleccionada).toBe(23);
    expect(fixture.nativeElement.textContent).toContain('Zona contrato');
    expect(fixture.nativeElement.textContent).toContain('No hay indicadores');
    fixture.destroy();
  });
  it('hides camera writes from analysts', () => {
    role('Analista');
    const fixture = TestBed.createComponent(Camaras);
    fixture.detectChanges();
    http.expectOne(base + '/admin/camaras').flush([camera]);
    http.expectOne(base + '/zonas').flush([zone]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('+ Nueva cámara');
    expect(fixture.nativeElement.textContent).not.toContain('Desactivar');
    fixture.componentInstance.abrirFormulario();
    expect(fixture.componentInstance.mostrarFormulario).toBeFalse();
    fixture.destroy();
  });
  it('waits for server confirmation and leaves a rejected camera form open', () => {
    role('Administrador');
    const fixture = TestBed.createComponent(Camaras);
    fixture.detectChanges();
    http.expectOne(base + '/admin/camaras').flush([]);
    http.expectOne(base + '/zonas').flush([zone]);
    const page = fixture.componentInstance;
    page.abrirFormulario();
    page.nuevaCamara = {
      nombre: 'Cámara contrato',
      zonaId: 23,
      tipo: 'fija',
      estado: 'activa',
      intervaloMuestreoSeg: 60,
      urlStream: 'rtsp://example.invalid/video',
      zonePolygon: null,
    };
    page.guardarCamara();
    expect(page.mostrarFormulario).toBeTrue();
    expect(page.camaras.length).toBe(0);
    const req = http.expectOne(base + '/admin/camaras');
    req.flush({ detail: 'Conflicto de datos' }, { status: 409, statusText: 'Conflict' });
    fixture.detectChanges();
    expect(page.mostrarFormulario).toBeTrue();
    expect(page.camaras.length).toBe(0);
    expect(fixture.nativeElement.textContent).toContain('Conflicto de datos');
    fixture.destroy();
  });
  it('does not send an invalid normalized polygon to the API', () => {
    role('Administrador');
    const fixture = TestBed.createComponent(Camaras);
    fixture.detectChanges();
    http.expectOne(base + '/admin/camaras').flush([]);
    http.expectOne(base + '/zonas').flush([zone]);
    const page = fixture.componentInstance;
    page.abrirFormulario();
    page.nuevaCamara.nombre = 'Cámara';
    page.nuevaCamara.zonaId = 23;
    page.nuevaCamara.urlStream = 'rtsp://example.invalid/video';
    page.poligono = '[[0,0],[2,0],[1,1]]';
    page.guardarCamara();
    expect(page.saving.error()).toContain('coordenadas entre 0 y 1');
    http.expectNone((r) => r.method === 'POST');
    fixture.destroy();
  });
  it('restricts cancellation to pending requests owned by the user or admin', () => {
    const page = TestBed.runInInjectionContext(() => new Analisis());
    const pending: Procesamiento = {
      id: 1,
      zonaId: 23,
      camaraId: 42,
      usuarioId: 7,
      tipoFuente: 'video',
      rutaArchivo: 'video.mp4',
      fechaCapturaInicio: new Date(),
      fechaInicioProceso: new Date(),
      fechaFinProceso: null,
      estado: 'pendiente',
      mensajeError: null,
    };
    role('Analista');
    expect(page.puedeCancelar(pending)).toBeTrue();
    expect(page.puedeCancelar({ ...pending, usuarioId: 8 })).toBeFalse();
    expect(page.puedeCancelar({ ...pending, estado: 'procesando' })).toBeFalse();
    role('Administrador');
    expect(page.puedeCancelar({ ...pending, usuarioId: 8 })).toBeTrue();
    expect(page.puedeCancelar({ ...pending, estado: 'completado' })).toBeFalse();
  });
  it('pages indicators on screen and includes all queried records in print', () => {
    const fixture = TestBed.createComponent(Reportes);
    fixture.detectChanges();
    http.expectOne(base + '/zonas').flush([zone]);
    const rows = Array.from({ length: 17 }, (_, id) => ({
      id_indicador: id + 1,
      id_zona: 23,
      periodo_tipo: 'hora',
      periodo_inicio: '2026-10-09T08:00:00',
      periodo_fin: '2026-10-09T09:00:00',
      total_peatones: 0,
      promedio_peatones: 0,
      max_peatones: 0,
      nivel_concentracion: 'bajo',
    }));
    http.expectOne((r) => r.url === base + '/indicadores').flush(rows);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(15);
    fixture.componentInstance.beforePrint();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(17);
    fixture.componentInstance.afterPrint();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(15);
    fixture.destroy();
  });
});
