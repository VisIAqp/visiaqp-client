import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Contexto } from './contexto';
import { Auth } from '../../core/auth/auth';

const base = 'http://localhost:8000/api';
const zona = { id_zona: 23, nombre: 'Zona de contrato', pais: 'PE', estado: 'activa',
  latitud: -16.4, longitud: -71.5, descripcion: null, ubicacion: null };
const pagina = (datos: unknown[] = [], total = datos.length, desplazamiento = 0) => ({
  consultado_en: '2026-10-31T18:00:00', zona_horaria: 'America/Lima', datos,
  total, limite: 100, desplazamiento, tiene_mas: desplazamiento + datos.length < total,
  sincronizacion: null, coordenadas_configuradas: true,
});
const clima = { hora: '2026-10-01T10:00:00', temperatura_c: null, precipitacion_mm: 0,
  humedad_porcentaje: null, codigo_tiempo: 0, tipo_dato: 'historico_modelado', modelo: 'era5',
  fuente: 'open_meteo', consultado_en: '2026-10-31T18:00:00' };
const evento = { id_evento: 7, fecha: '2026-08-15', nombre: 'Evento de contrato', tipo: 'evento',
  alcance: 'local', id_zona: 23, fuente: 'manual', referencia: 'https://www.gob.pe/ejemplo',
  activo: true, actualizado_en: '2026-10-31T18:00:00', editable: true };

describe('Calendario y clima', () => {
  let http: HttpTestingController;
  let auth: Auth;
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({ imports: [Contexto],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])] });
    http = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(Auth);
  });
  afterEach(() => { auth.clear(); http.verify({ ignoreCancelled: true }); });
  function rol(valor: string) {
    auth.token.set('header.' + btoa(JSON.stringify({ sub: '7', rol: valor, exp: Math.floor(Date.now() / 1000) + 3600 })) + '.firma');
  }
  function iniciar(admin = false, coordenadas = true) {
    rol(admin ? 'Administrador' : 'Analista');
    const f = TestBed.createComponent(Contexto);
    f.detectChanges();
    http.expectOne(base + '/zonas').flush([coordenadas ? zona : { ...zona, latitud: null, longitud: null }]);
    return f;
  }
  function vaciar(excepto = '') {
    for (const r of http.match((r) => r.url.startsWith(base + '/contexto/') && !r.url.endsWith(excepto || 'ninguno')))
      r.flush(pagina());
  }
  it('usa los filtros aplicados del dashboard y mantiene el detalle horario con agrupación diaria', () => {
    const f = TestBed.createComponent(Contexto);
    f.componentRef.setInput('filtros', { desde: '2026-10-01T00:00:00', hasta: '2026-10-04T00:00:00',
      periodo: 'dia', id_zona: 23, id_camara: 8, id_procesamiento: 42, tipo_fuente: 'video' });
    f.detectChanges();
    http.expectOne(base + '/zonas').flush([zona]);
    const r = http.expectOne((r) => r.url.endsWith('/contexto/series'));
    expect(r.request.params.get('id_camara')).toBe('8');
    expect(r.request.params.get('id_procesamiento')).toBe('42');
    expect(r.request.params.get('tipo_fuente')).toBe('video');
    expect(r.request.params.get('periodo')).toBe('hora');
    expect(r.request.params.get('hasta')).toBe('2026-10-04T00:00:00');
    r.flush(pagina());
    const clima = http.expectOne((r) => r.url.endsWith('/contexto/clima'));
    expect(clima.request.params.get('hasta')).toBe('2026-10-03');
    clima.flush(pagina());
    http.expectOne((r) => r.url.endsWith('/contexto/calendario')).flush(pagina());
    f.detectChanges();
    expect(f.nativeElement.querySelector('input[name="desde"]')).toBeNull();
    expect(f.nativeElement.querySelector('h2')).toBeNull();
    expect(f.nativeElement.textContent).toContain('Ocupación y contexto por hora');
    f.destroy();
  });
  it('abrir la página solo consulta guardados y oculta escrituras a analistas', () => {
    const f = iniciar();
    const solicitudes = http.match((r) => r.url.startsWith(base + '/contexto/'));
    expect(solicitudes.length).toBe(3);
    expect(solicitudes.every((r) => r.request.method === 'GET')).toBeTrue();
    expect(solicitudes.every((r) => r.request.params.get('id_zona') === '23')).toBeTrue();
    solicitudes.forEach((r) => r.flush(pagina()));
    f.detectChanges();
    expect(f.nativeElement.textContent).not.toContain('Sincronizar nacionales');
    expect(f.nativeElement.textContent).not.toContain('Guardar fecha');
    f.componentInstance.sincronizarClima(); f.componentInstance.sincronizarCalendario(); f.componentInstance.guardarEvento();
    http.expectNone((r) => r.method !== 'GET');
    f.destroy();
  });
  it('muestra lluvia cero y temperatura ausente como valores diferentes', () => {
    const f = iniciar();
    http.expectOne((r) => r.url.endsWith('/contexto/clima')).flush(pagina([clima]));
    vaciar(); f.detectChanges();
    expect(f.nativeElement.textContent).toContain('0 mm');
    expect(f.nativeElement.textContent).toContain('Sin dato');
    expect(f.nativeElement.textContent).toContain('Histórico modelado');
    expect(f.nativeElement.textContent).toContain('Despejado');
    f.destroy();
  });
  it('impide sincronizar una zona sin coordenadas y permite consultar su calendario', () => {
    const f = iniciar(true, false); vaciar(); f.detectChanges();
    f.componentInstance.sincronizarClima();
    http.expectNone((r) => r.method === 'POST');
    const boton = [...f.nativeElement.querySelectorAll('button')].find((b) => (b as HTMLButtonElement).textContent?.includes('Sincronizar clima')) as HTMLButtonElement;
    expect(boton.disabled).toBeTrue();
    expect(f.nativeElement.textContent).toContain('coordenadas configuradas');
    f.destroy();
  });
  it('usa el rango aplicado y conserva el clima guardado si falla la actualización', () => {
    const f = iniciar(true);
    http.expectOne((r) => r.url.endsWith('/contexto/clima')).flush(pagina([clima]));
    vaciar();
    const aplicado = f.componentInstance.aplicado!;
    f.componentInstance.zonaId = 999;
    f.componentInstance.sincronizarClima();
    const r = http.expectOne(base + '/contexto/clima/sincronizar');
    expect(r.request.body).toEqual({ id_zona: 23, desde: aplicado.desde, hasta: aplicado.hasta });
    r.flush({}, { status: 503, statusText: 'Unavailable' });
    f.detectChanges();
    expect(f.componentInstance.clima.filas[0].precipitacion_mm).toBe(0);
    expect(f.nativeElement.textContent).toContain('0 mm');
    expect(f.componentInstance.syncClima.error()).not.toBe('');
    f.destroy();
  });
  it('una respuesta de caché no se presenta como calendario vacío ni lanza otro POST', () => {
    const f = iniciar(true); vaciar();
    f.componentInstance.sincronizarCalendario();
    http.expectOne((r) => r.url.includes('/calendario/sincronizar')).flush({ estado: 'cache', registros: 0, consultado_en: '2026-10-31T18:00:00' });
    vaciar(); f.detectChanges();
    expect(f.nativeElement.textContent).toContain('siguen vigentes');
    http.expectNone((r) => r.method === 'POST');
    f.destroy();
  });
  it('pide fuente pública, conserva el formulario ante rechazo y no edita feriados del proveedor', () => {
    const f = iniciar(true); vaciar();
    f.componentInstance.formulario = { fecha: '2026-08-15', nombre: 'Aniversario', tipo: 'evento', alcance: 'local',
      id_zona: 23, referencia: 'https://usuario:clave@ejemplo.test', activo: true };
    f.componentInstance.guardarEvento();
    expect(f.componentInstance.guardar.error()).toContain('sin credenciales');
    http.expectNone((r) => r.method === 'POST');
    f.componentInstance.formulario.referencia = 'https://www.gob.pe/ejemplo';
    f.componentInstance.guardarEvento();
    const r = http.expectOne(base + '/contexto/eventos');
    expect(r.request.body.id_zona).toBe(23);
    r.flush({ detail: 'Referencia rechazada' }, { status: 422, statusText: 'Invalid' });
    expect(f.componentInstance.formulario.nombre).toBe('Aniversario');
    f.componentInstance.editar({ ...evento, fuente: 'nager_date_v3', editable: false } as typeof f.componentInstance.calendario.filas[number]);
    expect(f.componentInstance.eventoId).toBeUndefined();
    f.destroy();
  });
  it('editar un registro nacional envía ámbito nacional sin asignar zona', () => {
    const f = iniciar(true); vaciar();
    f.componentInstance.editar({ ...evento, tipo: 'feriado', alcance: 'nacional', id_zona: null } as typeof f.componentInstance.calendario.filas[number]);
    f.componentInstance.formulario.id_zona = 23;
    f.componentInstance.guardarEvento();
    const r = http.expectOne(base + '/contexto/eventos/7');
    expect(r.request.method).toBe('PUT');
    expect(r.request.body.id_zona).toBeNull();
    r.flush({ ...evento, alcance: 'nacional', id_zona: null });
    vaciar();
    expect(f.componentInstance.mensajeEvento).toContain('guardado');
    f.destroy();
  });
  it('cancela lecturas antiguas y rechaza un rango inválido sin iniciar nuevas consultas', () => {
    const f = iniciar();
    const anteriores = http.match((r) => r.url.includes('/contexto/'));
    f.componentInstance.desde = '2026-10-01'; f.componentInstance.hasta = '2026-11-30';
    f.componentInstance.consultar();
    expect(anteriores.every((r) => r.cancelled)).toBeTrue();
    expect(f.componentInstance.errorFiltros).not.toBe('');
    http.expectNone((r) => r.url.includes('/contexto/'));
    f.destroy();
  });
  it('reintenta la página climática fallida con el mismo desplazamiento', () => {
    const f = iniciar(); vaciar();
    f.componentInstance.cargarClima(100);
    http.expectOne((r) => r.url.endsWith('/contexto/clima')).flush({}, { status: 503, statusText: 'Unavailable' });
    f.componentInstance.clima.reintentar();
    const r = http.expectOne((r) => r.url.endsWith('/contexto/clima'));
    expect(r.request.params.get('desplazamiento')).toBe('100');
    r.flush(pagina([clima], 101, 100));
    expect(f.componentInstance.clima.numeroPagina).toBe(2);
    f.destroy();
  });
});
