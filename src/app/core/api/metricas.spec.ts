import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { MetricasService } from '../services/metricas';
import { Dashboard } from '../../pages/dashboard/dashboard';
import { Monitoreo } from '../../pages/monitoreo/monitoreo';
import { FiltrosMetricas, PuntoSerie } from '../models/metricas.model';
import { prepararSeries, rangoValido } from './metricas-presentacion';

const base = 'http://localhost:8000/api';
const filtros: FiltrosMetricas = { desde: '2026-10-01T00:00:00', hasta: '2026-11-01T00:00:00', periodo: 'hora', id_camara: 42 };
const pagina = (datos: unknown[] = [], total = datos.length, desplazamiento = 0, limite = 200) => ({
  datos, total, desplazamiento, limite, tiene_mas: desplazamiento + datos.length < total,
  consultado_en: '2026-10-31T18:00:00', zona_horaria: 'America/Lima',
});
const resumen = { ...filtros, consultado_en: '2026-10-31T18:00:00', cantidad_ventanas: 0,
  suma_identificadores: 0, ventanas_con_ocupacion: 0, zonas_con_resultados: 0,
  camaras_con_resultados: 0, procesamientos_con_resultados: 0, ultima_ventana_fin: null,
  ultima_recepcion: null, camaras_habilitadas: 1, camaras_registradas: 1, zonas_activas: 1,
  procesamientos_en_curso: 501, videos_pendientes: 0, transmisiones_reportando: 1 };
const zona = { id_zona: 23, nombre: 'Zona contrato', descripcion: null, ubicacion: null,
  pais: 'PE', latitud: null, longitud: null, estado: 'activa' };
const camara = { id_camara: 42, id_zona: 23, nombre: 'Cámara contrato', tipo: 'fija',
  estado: 'activa', intervalo_muestreo_seg: 60, zone_polygon: [[0, 0], [1, 0], [1, 1]],
  ultima_conexion: null, tiene_url_stream: true };
function punto(id = 1, hora = 10, valor: number | null = 0): PuntoSerie {
  return { id_zona: 23, nombre_zona: 'Zona contrato', id_camara: 42, id_procesamiento: id,
    tipo_fuente: 'stream', periodo_inicio: `2026-10-31T${hora}:00:00`, periodo_fin: `2026-10-31T${hora + 1}:00:00`,
    periodo_cerrado: true, cantidad_ventanas: 1, suma_identificadores: 4, ventanas_con_ocupacion: 1,
    camaras_distintas: 1, procesamientos_distintos: 1, primera_ventana_inicio: `2026-10-31T${hora}:00:00`,
    ultima_ventana_fin: `2026-10-31T${hora}:01:00`, ultima_recepcion: '2026-10-31T18:00:00',
    promedio_presentes: valor, max_presentes: valor, segundos_observados: 60,
    nivel_ocupacion: valor === null ? null : 'bajo', estado_ocupacion: valor === null ? 'sin_datos' : 'disponible' };
}

describe('Presentación de métricas', () => {
  it('conserva ceros, huecos y ejecuciones separadas', () => {
    const grafico = prepararSeries([punto(1, 10, 0), punto(1, 12, 4), punto(2, 10, 9)], 'hora');
    expect(grafico.labels.length).toBe(3);
    expect(grafico.series[0].datos).toEqual([0, null, 4]);
    expect(grafico.series[1].datos).toEqual([9, null, null]);
  });
  it('acepta 31 días inclusivos y rechaza fechas inexistentes o rangos mayores', () => {
    expect(rangoValido('2026-10-01', '2026-10-31')).toBeTrue();
    expect(rangoValido('2026-10-01', '2026-11-01')).toBeFalse();
    expect(rangoValido('2026-02-31', '2026-03-01')).toBeFalse();
    expect(rangoValido('', '2026-10-31')).toBeFalse();
  });
});

describe('Dashboard y monitoreo con endpoints agregados', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({ imports: [Dashboard, Monitoreo],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])] });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify({ ignoreCancelled: true }));
  function catalogo() {
    http.expectOne(base + '/zonas').flush([zona]);
    http.expectOne(base + '/admin/camaras').flush([camara]);
  }
  function vaciarPaneles(excepto = '') {
    for (const req of http.match((r) => r.url.startsWith(base + '/metricas/') && !r.url.endsWith(excepto || 'ninguno')))
      req.flush(req.request.url.endsWith('/resumen') ? resumen : pagina());
  }
  it('consulta la última fila en lugar de interpretar la primera como reciente', () => {
    let ultima: PuntoSerie | undefined;
    TestBed.inject(MetricasService).ultimaSerie(filtros).subscribe((p) => ultima = p.datos[0]);
    const primera = http.expectOne((r) => r.url.endsWith('/metricas/series'));
    expect(primera.request.params.get('limite')).toBe('1');
    expect(primera.request.params.get('id_camara')).toBe('42');
    primera.flush(pagina([punto(1, 10, 1)], 3, 0, 1));
    const siguiente = http.expectOne((r) => r.url.endsWith('/metricas/series'));
    expect(siguiente.request.params.get('desplazamiento')).toBe('2');
    siguiente.flush(pagina([punto(1, 12, 5)], 3, 2, 1));
    expect(ultima?.promedio_presentes).toBe(5);
  });
  it('mantiene el resumen completo cuando falla únicamente un gráfico', () => {
    const f = TestBed.createComponent(Dashboard);
    f.detectChanges(); catalogo();
    const serie = http.expectOne((r) => r.url.endsWith('/metricas/series'));
    serie.flush({}, { status: 503, statusText: 'Unavailable' });
    vaciarPaneles(); f.detectChanges();
    expect(f.componentInstance.resumen?.procesamientos_en_curso).toBe(501);
    expect(f.nativeElement.textContent).toContain('501');
    expect(f.nativeElement.textContent).toContain('El servidor no pudo completar');
    expect(f.componentInstance.serie.estado.error()).not.toBe('');
    expect(f.componentInstance.resumenEstado.error()).toBe('');
    f.destroy();
  });
  it('cancela consultas anteriores si el nuevo rango es inválido', () => {
    const f = TestBed.createComponent(Dashboard);
    f.detectChanges(); catalogo();
    const anteriores = http.match((r) => r.url.includes('/metricas/'));
    expect(anteriores.length).toBe(6);
    f.componentInstance.desde = '2026-10-01';
    f.componentInstance.hasta = '2026-11-01';
    f.componentInstance.buscar();
    expect(anteriores.every((r) => r.cancelled)).toBeTrue();
    expect(f.componentInstance.resumen).toBeNull();
    http.expectNone((r) => r.url.includes('/metricas/'));
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('hasta 31 días');
    f.destroy();
  });
  it('pagina con los filtros aplicados y no con cambios aún sin consultar', () => {
    const f = TestBed.createComponent(Dashboard);
    f.detectChanges(); catalogo();
    const serie = http.expectOne((r) => r.url.endsWith('/metricas/series'));
    serie.flush(pagina([punto()], 201));
    vaciarPaneles();
    f.componentInstance.zonaSeleccionada = 999;
    f.componentInstance.cargarSerie(200);
    const siguiente = http.expectOne((r) => r.url.endsWith('/metricas/series'));
    expect(siguiente.request.params.has('id_zona')).toBeFalse();
    expect(siguiente.request.params.get('desplazamiento')).toBe('200');
    siguiente.flush(pagina([punto(2)], 201, 200));
    expect(f.componentInstance.serie.numeroPagina).toBe(2);
    f.destroy();
  });
  it('reintenta la página que falló sin volver silenciosamente a la primera', () => {
    const f = TestBed.createComponent(Dashboard);
    f.detectChanges(); catalogo(); vaciarPaneles();
    f.componentInstance.cargarSerie(200);
    http.expectOne((r) => r.url.endsWith('/metricas/series')).flush({}, { status: 503, statusText: 'Unavailable' });
    f.componentInstance.serie.reintentar();
    const intento = http.expectOne((r) => r.url.endsWith('/metricas/series'));
    expect(intento.request.params.get('desplazamiento')).toBe('200');
    intento.flush(pagina([punto()], 201, 200));
    expect(f.componentInstance.serie.numeroPagina).toBe(2);
    f.destroy();
  });
  it('no presenta mediciones históricas como cero ni como nivel bajo', () => {
    const f = TestBed.createComponent(Dashboard);
    f.detectChanges(); catalogo();
    http.expectOne((r) => r.url.endsWith('/metricas/series')).flush(pagina([punto(1, 10, null)]));
    vaciarPaneles(); f.detectChanges();
    expect(f.componentInstance.serieConMedicion).toBeFalse();
    expect(f.nativeElement.textContent).toContain('Solo conteos históricos');
    expect(f.nativeElement.textContent).toContain('No hay ocupación consolidada');
    f.destroy();
  });
  it('el mapa distingue cero medido de un grupo ausente en la página', () => {
    const f = TestBed.createComponent(Dashboard);
    f.detectChanges(); catalogo();
    http.expectOne((r) => r.url.endsWith('/metricas/patrones')).flush(pagina([
      { ...punto(1, 10, 0), dia_semana: 5, hora: 10 },
    ]));
    vaciarPaneles(); f.detectChanges();
    const celda = f.nativeElement.querySelector('td.nivel-bajo');
    expect(celda.textContent.trim()).toBe('0');
    expect(f.componentInstance.descripcionCelda(0, 0)).toContain('Sin grupo en esta página');
    f.destroy();
  });
  it('monitoreo consulta actividad por cámara y no deduce el estado del historial', () => {
    const f = TestBed.createComponent(Monitoreo);
    f.detectChanges(); catalogo();
    f.componentInstance.seleccionarCamara(42);
    const estado = http.expectOne((r) => r.url.endsWith('/metricas/estado-camaras'));
    expect(estado.request.params.get('id_camara')).toBe('42');
    estado.flush(pagina([{ id_camara: 42, id_zona: 23, nombre_camara: 'Cámara contrato',
      nombre_zona: 'Zona contrato', estado_configuracion: 'activa', estado_operativo: 'reportando',
      id_procesamiento: 9, ultima_actividad: '2026-10-31T18:00:00', ultima_muestra: null,
      segundos_sin_actividad: 1, fps_procesamiento: 2, edad_imagen_seg: 0 }]));
    const historia = http.expectOne((r) => r.url.endsWith('/procesamientos'));
    expect(historia.request.params.get('id_camara')).toBe('42');
    historia.flush([]);
    const medicion = http.expectOne((r) => r.url.endsWith('/metricas/series'));
    expect(medicion.request.params.get('id_procesamiento')).toBe('9');
    medicion.flush(pagina([punto(9, 10, 0)], 1, 0, 1));
    f.detectChanges();
    expect(f.componentInstance.estadoTransmision).toBe('Motor reportando actividad');
    expect(f.componentInstance.ultimaMedicion?.promedio_presentes).toBe(0);
    expect(f.nativeElement.textContent).toContain('Personas presentes');
    f.destroy();
  });
});
