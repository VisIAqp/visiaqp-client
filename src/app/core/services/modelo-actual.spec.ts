import { TestBed } from '@angular/core/testing';
import { IndicadorService } from './indicador';
import { UmbralService } from './umbral';
import { AnalisisService } from './analisis';
import { CamaraService } from './camara';
import { MonitoreoService } from './monitoreo';
import { Analisis } from '../../pages/analisis/analisis';
import { Dashboard } from '../../pages/dashboard/dashboard';
import { Camaras } from '../../pages/camaras/camaras';
import { Reportes } from '../../pages/reportes/reportes';

describe('Compatibilidad con el esquema actual', () => {
  beforeEach(() => TestBed.configureTestingModule({}));
  it('aplica ambos límites inclusivos y usa la configuración de cada zona', () => {
    const s = TestBed.inject(UmbralService);
    expect(s.calcularNivel(1, 9)).toBe('bajo');
    expect(s.calcularNivel(1, 10)).toBe('medio');
    expect(s.calcularNivel(1, 29)).toBe('medio');
    expect(s.calcularNivel(1, 30)).toBe('alto');
    expect(s.calcularNivel(2, 30)).toBe('medio');
    expect(s.calcularNivel(3, 30)).toBeNull();
  });
  it('conserva cero como observación y ausencia como undefined', () => {
    const registros = TestBed.inject(AnalisisService).obtenerRegistros();
    expect(registros.find(r => r.id === 1)?.cantidadPeatones).toBe(0);
    expect(registros.find(r => r.id === 1)?.confianzaPromedio).toBeNull();
    expect(TestBed.inject(MonitoreoService).obtenerPorCamara(3)).toBeUndefined();
  });
  it('obtiene análisis activo del procesamiento, no del estado de cámara', () => {
    const analisis = TestBed.inject(AnalisisService);
    expect(analisis.estaAnalizando(1)).toBeTrue();
    expect(analisis.estaAnalizando(2)).toBeFalse();
    expect(analisis.obtenerProcesamientos().find(p => p.id === 4)?.mensajeError).toBeTruthy();
  });
  it('filtra archivos sin cámara por la zona del procesamiento', () => {
    const page = TestBed.runInInjectionContext(() => new Analisis());
    page.zonaSeleccionada = 2;
    expect(page.registrosFiltrados.length).toBeGreaterThan(2);
    expect(page.registrosFiltrados.some(r => r.camaraId === null)).toBeTrue();
    page.camaraSeleccionada = 2;
    expect(page.registrosFiltrados.length).toBe(0);
    expect(page.procesamientosFiltrados[0].estado).toBe('error');
  });
  it('no combina indicadores de zonas o granularidades diferentes', () => {
    const page = TestBed.runInInjectionContext(() => new Dashboard());
    expect(page.indicadores.length).toBeGreaterThan(1);
    expect(page.indicadores.every(i => i.zonaId === 1 && i.periodoTipo === 'hora')).toBeTrue();
    page.periodoTipo = 'dia';
    expect(page.indicadores.length).toBe(3);
    expect(page.ultimoIndicador?.periodoTipo).toBe('dia');
    page.zonaSeleccionada = 3;
    expect(page.ultimoIndicador).toBeUndefined();
    expect(page.maximoRegistrado).toBe('Sin datos');
  });
  it('filtra reportes por fecha de evento y hora de Lima', () => {
    const page = TestBed.runInInjectionContext(() => new Reportes());
    page.zonaSeleccionada = 2;
    page.fechaInicio = '2026-10-09'; page.fechaFin = '2026-10-09';
    expect(page.registrosFiltrados.length).toBe(18);
    page.fechaInicio = '2026-10-10';
    expect(page.registrosFiltrados.length).toBe(0);
    page.limpiarFiltros();
    expect(page.registrosFiltrados.length).toBeGreaterThan(100);
  });
  it('rechaza intervalos inválidos y no expone credenciales en las cámaras', () => {
    const service = TestBed.inject(CamaraService);
    const datos = { nombre: 'Prueba', zonaId: 1, tipo: 'fija' as const, estado: 'mantenimiento' as const, intervaloMuestreoSeg: 0, urlStream: 'rtsp://user:pass@example.test/video' };
    expect(() => service.guardarCamara(datos)).toThrow();
    service.guardarCamara({ ...datos, intervaloMuestreoSeg: 15 });
    const camara = service.obtenerCamaras().at(-1)!;
    expect(camara.estado).toBe('mantenimiento');
    expect(camara.intervaloMuestreoSeg).toBe(15);
    expect(JSON.stringify(camara)).not.toContain('user:pass');
    expect(() => service.guardarCamara({ ...datos, intervaloMuestreoSeg: 15, urlStream: '' }, camara.id)).not.toThrow();
  });

  it('presenta Sin datos al seleccionar una zona sin indicadores', () => {
    const fixture = TestBed.createComponent(Dashboard);
    fixture.componentInstance.zonaSeleccionada = 3;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Sin datos');
    expect(fixture.nativeElement.textContent).toContain('Sin ventanas para esta zona');
    fixture.destroy();
  });
  it('muestra ventanas de archivos, ceros y estados de ejecución en el historial', () => {
    const fixture = TestBed.createComponent(Analisis);
    fixture.detectChanges();
    const texto = fixture.nativeElement.textContent;
    expect(texto).toContain('Archivo sin cámara');
    expect(texto).toContain('Pendiente');
    expect(texto).toContain('No se pudo conectar');
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows[0].textContent).toContain('Alto');
    fixture.destroy();
  });
  it('el formulario permite mantenimiento y valida un intervalo positivo', () => {
    const fixture = TestBed.createComponent(Camaras);
    fixture.componentInstance.abrirFormulario();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('option[value="mantenimiento"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('input[name="intervalo"]').min).toBe('1');
    fixture.componentInstance.nuevaCamara = { nombre: 'Prueba', zonaId: 1, tipo: 'fija', estado: 'activa', intervaloMuestreoSeg: 0, urlStream: 'https://example.test/video' };
    fixture.componentInstance.guardarCamara();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('intervalo');
    fixture.destroy();
  });

  it('los indicadores ficticios coinciden con las ventanas de cada zona y periodo', () => {
    const registros = TestBed.inject(AnalisisService).obtenerRegistros();
    const umbral = TestBed.inject(UmbralService);
    for (const indicador of TestBed.inject(IndicadorService).obtenerIndicadores()) {
      const ventanas = registros.filter(r => r.zonaId === indicador.zonaId && r.periodoInicio >= indicador.periodoInicio && r.periodoInicio < indicador.periodoFin);
      expect(ventanas.length).toBeGreaterThan(0);
      const total = ventanas.reduce((n,r) => n+r.cantidadPeatones, 0);
      expect(indicador.totalPeatones).toBe(total);
      expect(indicador.promedioPeatones).toBeCloseTo(total / ventanas.length, 2);
      expect(indicador.maxPeatones).toBe(Math.max(...ventanas.map(r => r.cantidadPeatones)));
      expect(indicador.nivelConcentracion).toBe(umbral.calcularNivel(indicador.zonaId, indicador.promedioPeatones)!);
    }
  });
  it('pagina las ventanas y reinicia al cambiar filtros', () => {
    const page = TestBed.runInInjectionContext(() => new Analisis());
    expect(page.registrosPagina.length).toBe(15);
    const ids = page.registrosPagina.map(r => r.id);
    page.cambiarPagina(1);
    expect(page.paginaActual).toBe(2);
    expect(page.registrosPagina.every(r => !ids.includes(r.id))).toBeTrue();
    page.zonaSeleccionada = 5;
    page.aplicarFiltros();
    expect(page.paginaActual).toBe(1);
    expect(page.registrosPagina.length).toBe(3);
  });
});
