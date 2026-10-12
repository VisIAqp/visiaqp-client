import { TestBed } from '@angular/core/testing';
import { DestroyRef } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Api } from './api';
import { DtoMapper } from './dto';
import { Auth } from '../auth/auth';
import { authInterceptor } from '../auth/auth-interceptor';
import { CamaraService } from '../services/camara';
import { ZonaService } from '../services/zona';
import { IndicadorService } from '../services/indicador';
import { AnalisisService } from '../services/analisis';
import { UmbralService } from '../services/umbral';
import { VideoService } from '../services/video';
import { IndicatorQuery } from './indicator-query';
import { RequestState } from './request-state';
import { errorMessage } from './api-error';
import { createCsv, csvCell } from './csv';
import { addDays, exclusiveEnd } from './dates';
import { Camara } from '../models/camara.model';
import { Indicador } from '../models/indicador.model';

const base = 'http://localhost:8000/api';
const token = (role = 'Administrador', exp = Math.floor(Date.now() / 1000) + 3600) =>
  'eyJhbGciOiJIUzI1NiJ9.' + btoa(JSON.stringify({ sub: '7', rol: role, exp })) + '.test-signature';
const user = {
  id_usuario: 7,
  nombres: 'Prueba',
  apellidos: 'Contrato',
  username: 'test',
  email: 'test@example.invalid',
  estado: 'activo',
};
const camera = {
  id_camara: 9,
  id_zona: 3,
  nombre: 'Cámara contrato',
  tipo: 'fija',
  estado: 'activa',
  intervalo_muestreo_seg: 60,
  zone_polygon: null,
  ultima_conexion: null,
  tiene_url_stream: true,
};

describe('API contracts (test responses only)', () => {
  let http: HttpTestingController;
  let auth: Auth;
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
        IndicatorQuery,
      ],
    });
    http = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(Auth);
  });
  afterEach(() => {
    auth.clear();
    http.verify({ ignoreCancelled: true });
  });

  it('logs in with JSON and attaches JWT only to this API', () => {
    let logged = false;
    auth.login('test', 'test-password').subscribe(() => (logged = true));
    const login = http.expectOne(base + '/auth/login');
    expect(login.request.body).toEqual({ username: 'test', password: 'test-password' });
    expect(login.request.headers.has('Authorization')).toBeFalse();
    login.flush({ access_token: token(), token_type: 'bearer' });
    const me = http.expectOne(base + '/auth/me');
    expect(me.request.headers.get('Authorization')).toBe('Bearer ' + auth.token());
    me.flush(user);
    expect(logged).toBeTrue();
    expect(auth.isAdmin()).toBeTrue();
    expect(auth.user()?.id_usuario).toBe(7);
    TestBed.inject(HttpClient).get('https://example.invalid/outside').subscribe();
    const outside = http.expectOne('https://example.invalid/outside');
    expect(outside.request.headers.has('Authorization')).toBeFalse();
    outside.flush({});
  });
  it('clears an incomplete login when the profile request fails', () => {
    auth.login('test', 'test-password').subscribe({ error: () => {} });
    http.expectOne(base + '/auth/login').flush({ access_token: token(), token_type: 'bearer' });
    http.expectOne(base + '/auth/me').flush({}, { status: 503, statusText: 'Unavailable' });
    expect(auth.token()).toBe('');
    expect(sessionStorage.getItem('visiaqp.access_token')).toBeNull();
  });
  it('rejects expired sessions without requesting a profile', () => {
    auth.token.set(token('Analista', 1));
    auth.restore().subscribe();
    expect(auth.validToken()).toBeFalse();
    expect(auth.user()).toBeNull();
    http.expectNone(base + '/auth/me');
  });
  it('restores valid sessions and preserves the role from the token', () => {
    auth.token.set(token('Analista'));
    auth.restore().subscribe();
    http.expectOne(base + '/auth/me').flush(user);
    expect(auth.user()?.username).toBe('test');
    expect(auth.isAdmin()).toBeFalse();
  });
  it('logs out after an authenticated operation returns 401', () => {
    auth.token.set(token());
    auth.user.set(user);
    spyOn(TestBed.inject(Router), 'navigateByUrl').and.resolveTo(true);
    TestBed.inject(Api)
      .get('/zonas')
      .subscribe({ error: () => {} });
    http.expectOne(base + '/zonas').flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(auth.token()).toBe('');
    expect(TestBed.inject(Router).navigateByUrl).toHaveBeenCalledWith('/login');
  });
  it('keeps the session when the server denies permission', () => {
    auth.token.set(token('Analista'));
    TestBed.inject(Api)
      .post('/zonas', {})
      .subscribe({ error: () => {} });
    http.expectOne(base + '/zonas').flush({}, { status: 403, statusText: 'Forbidden' });
    expect(auth.validToken()).toBeTrue();
  });
  it('uses the public camera endpoint and drops source credentials from the view', () => {
    let result: Camara | undefined;
    TestBed.inject(CamaraService)
      .listar()
      .subscribe((rows) => (result = rows[0]));
    http
      .expectOne(base + '/admin/camaras')
      .flush([{ ...camera, url_stream: 'rtsp://hidden:secret@host' }]);
    expect(result?.tieneUrlStream).toBeTrue();
    expect(Object.keys(result!)).not.toContain('url_stream');
    expect(Object.keys(result!)).not.toContain('urlStream');
    http.expectNone(base + '/camaras');
  });
  it('updates cameras without moving their zone or clearing an empty source', () => {
    TestBed.inject(CamaraService)
      .guardar(
        {
          nombre: 'Editada',
          zonaId: 3,
          tipo: 'fija',
          estado: 'activa',
          intervaloMuestreoSeg: 30,
          urlStream: '',
          zonePolygon: null,
        },
        9,
      )
      .subscribe();
    const req = http.expectOne(base + '/admin/camaras/9');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body.id_zona).toBeUndefined();
    expect(req.request.body.url_stream).toBeUndefined();
    expect(req.request.body.intervalo_muestreo_seg).toBe(30);
    req.flush(camera);
  });
  it('sends the source only as camera input', () => {
    TestBed.inject(CamaraService)
      .guardar({
        nombre: 'Nueva',
        zonaId: 3,
        tipo: 'fija',
        estado: 'activa',
        intervaloMuestreoSeg: 60,
        urlStream: 'rtsp://source.invalid/video',
        zonePolygon: null,
      })
      .subscribe();
    const req = http.expectOne(base + '/admin/camaras');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.id_zona).toBe(3);
    expect(req.request.body.url_stream).toBe('rtsp://source.invalid/video');
    req.flush(camera);
  });
  it('maps decimal coordinates and explicit or naive timestamps', () => {
    const mapper = TestBed.inject(DtoMapper);
    const zona = mapper.zona({
      id_zona: 3,
      nombre: 'Contrato',
      descripcion: null,
      ubicacion: null,
      pais: 'PE',
      latitud: '-16.5',
      longitud: null,
      estado: 'activa',
    });
    expect(zona.latitud).toBe(-16.5);
    expect(zona.longitud).toBeNull();
    expect(mapper.date('2026-01-01T00:00:00').toISOString()).toBe('2026-01-01T05:00:00.000Z');
    expect(mapper.date('2026-01-01T00:00:00Z').toISOString()).toBe('2026-01-01T00:00:00.000Z');
  });
  it('queries indicators with an exclusive upper date and preserves zero', () => {
    let rows: Indicador[] = [];
    TestBed.inject(IndicadorService)
      .historico(3, 'dia', '2026-10-09T00:00:00', exclusiveEnd('2026-10-09'))
      .subscribe((r) => (rows = r));
    const req = http.expectOne((r) => r.url === base + '/indicadores');
    expect(req.request.params.get('id_zona')).toBe('3');
    expect(req.request.params.get('periodo_tipo')).toBe('dia');
    expect(req.request.params.get('hasta')).toBe('2026-10-10T00:00:00');
    expect(req.request.params.get('limite')).toBe('2000');
    req.flush([
      {
        id_indicador: 1,
        id_zona: 3,
        periodo_tipo: 'dia',
        periodo_inicio: '2026-10-09T00:00:00',
        periodo_fin: '2026-10-10T00:00:00',
        total_peatones: 0,
        promedio_peatones: 0,
        max_peatones: 0,
        nivel_concentracion: 'bajo',
      },
    ]);
    expect(rows[0].promedioPeatones).toBe(0);
    expect(rows[0].totalPeatones).toBe(0);
  });
  it('reads available videos and sends capture dates without a timezone', () => {
    TestBed.inject(VideoService).listar().subscribe();
    const catalog = http.expectOne((r) => r.url === base + '/videos');
    expect(catalog.request.params.get('solo_disponibles')).toBe('true');
    catalog.flush([]);
    TestBed.inject(AnalisisService).solicitar(2, 9, '2026-10-09T08:00:00').subscribe();
    const req = http.expectOne(base + '/procesamientos/solicitar');
    expect(req.request.body).toEqual({
      id_video: 2,
      id_camara: 9,
      fecha_captura_inicio: '2026-10-09T08:00:00',
    });
    req.flush({
      id_procesamiento: 4,
      id_zona: 3,
      id_camara: 9,
      id_usuario: 7,
      tipo_fuente: 'video',
      ruta_archivo: 'video.mp4',
      fecha_captura_inicio: '2026-10-09T08:00:00',
      fecha_inicio_proceso: '2026-10-09T08:00:00',
      fecha_fin_proceso: null,
      estado: 'pendiente',
      mensaje_error: null,
    });
  });
  it('uses the cancellation endpoint for user requests', () => {
    TestBed.inject(AnalisisService).cancelar(4).subscribe();
    const req = http.expectOne(base + '/procesamientos/4/cancelar');
    expect(req.request.method).toBe('PATCH');
    req.flush({ id_procesamiento: 4, estado: 'error' });
  });
  it('recognizes default thresholds without hiding an unknown zone', () => {
    let result: unknown = 'unset';
    const svc = TestBed.inject(UmbralService);
    svc.obtener(3).subscribe((u) => (result = u));
    http
      .expectOne(base + '/zonas/3/umbral')
      .flush(
        { detail: 'La zona no tiene umbral configurado (se usan los valores por defecto)' },
        { status: 404, statusText: 'Not found' },
      );
    expect(result).toBeNull();
    let failed = false;
    svc.obtener(99).subscribe({ error: () => (failed = true) });
    http
      .expectOne(base + '/zonas/99/umbral')
      .flush({ detail: 'Zona no encontrada' }, { status: 404, statusText: 'Not found' });
    expect(failed).toBeTrue();
  });
  it('cancels earlier queries so stale responses cannot overwrite newer data', () => {
    const state = new RequestState(TestBed.inject(DestroyRef));
    const first = new Subject<number>();
    const second = new Subject<number>();
    let result = 0;
    state.run(first, (value) => (result = value));
    state.run(second, (value) => (result = value));
    first.next(1);
    second.next(2);
    second.complete();
    expect(result).toBe(2);
    expect(state.loading()).toBeFalse();
  });
  it('does not confirm writes when the server rejects them', () => {
    let saved = false;
    TestBed.inject(ZonaService)
      .guardar({ nombre: 'Duplicada', ubicacion: null })
      .subscribe({ next: () => (saved = true), error: () => {} });
    http
      .expectOne(base + '/zonas')
      .flush(
        { detail: 'Ya existe una zona con ese nombre' },
        { status: 409, statusText: 'Conflict' },
      );
    expect(saved).toBeFalse();
  });
  it('formats network and validation errors without exposing source credentials', () => {
    expect(errorMessage(new HttpErrorResponse({ status: 0 }))).toContain('No se pudo conectar');
    expect(
      errorMessage(
        new HttpErrorResponse({
          status: 422,
          error: { detail: [{ loc: ['body', 'nombre'], msg: 'Campo requerido' }] },
        }),
      ),
    ).toContain('nombre: Campo requerido');
    expect(
      errorMessage(
        new HttpErrorResponse({
          status: 409,
          error: { detail: 'Fallo rtsp://user:pass@host/video' },
        }),
      ),
    ).not.toContain('user:pass');
  });
  it('exports valid CSV, escapes quotes and neutralizes formulas', () => {
    const csv = createCsv([
      ['Zona', 'Conteo'],
      ['=1+1', 0],
      ['texto "con comillas"', 2],
    ]);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv).toContain(String.fromCharCode(13, 10));
    expect(csvCell('=1+1').charCodeAt(1)).toBe(39);
    expect(csv).toContain('"texto ""con comillas"""');
    expect(csv).toContain('"0"');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });
});
