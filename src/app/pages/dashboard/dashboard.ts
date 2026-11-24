import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { filter, forkJoin, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Auth } from '../../core/auth/auth';
import { API_CONFIG } from '../../core/api/api-config';
import { RequestState } from '../../core/api/request-state';
import { PanelMetricas } from '../../core/api/panel-metricas';
import { ApiState } from '../../shared/api-state/api-state';
import { Pagination } from '../../shared/pagination/pagination';
import { ZonaService } from '../../core/services/zona';
import { CamaraService } from '../../core/services/camara';
import { MetricasService } from '../../core/services/metricas';
import { Zona } from '../../core/models/zona.model';
import { Camara } from '../../core/models/camara.model';
import { DatosOcupacionReciente, EstadoCamara, FiltrosMetricas, PaginaOcupacionZonas, PuntoSerie, PuntoZona, ResumenMetricas, VentanaOcupacion } from '../../core/models/metricas.model';
import { PronosticoOcupacion as DatosPronostico } from '../../core/models/pronostico.model';
import { MonitoreoService } from '../../core/services/monitoreo';
import { GraficoZonas } from '../../shared/grafico-zonas/grafico-zonas';
import { PronosticoOcupacion } from '../../shared/pronostico-ocupacion/pronostico-ocupacion';
import { claveSerieCamara, nombreSerieCamara } from '../../shared/graficos/ocupacion-estilo';
import { AgrupacionOcupacion, FiltrosOcupacion, OpcionesOcupacion, VistaOcupacion } from './filtros-ocupacion/filtros-ocupacion';
import { GraficoOcupacion } from './grafico-ocupacion/grafico-ocupacion';
import { addDays, exclusiveEnd, limaToday } from '../../core/api/dates';
import { estadoMedicion, estadoOperativo, etiquetaEjecucion, mostrarFecha, rangoValido } from '../../core/api/metricas-presentacion';

@Component({
  selector: 'app-dashboard', imports: [CommonModule, FormsModule, RouterLink, ApiState, Pagination, GraficoOcupacion, GraficoZonas, PronosticoOcupacion, FiltrosOcupacion],
  templateUrl: './dashboard.html',
  host: { class: 'block' },
})
export class Dashboard implements OnInit {
  private zonasApi = inject(ZonaService);
  private camarasApi = inject(CamaraService);
  private metricas = inject(MetricasService);
  private monitoreo = inject(MonitoreoService);
  private auth = inject(Auth);
  private config = inject(API_CONFIG);
  private ref = inject(DestroyRef);
  readonly request = new RequestState(this.ref);
  readonly resumenEstado = new RequestState(this.ref, true);
  readonly serie = new PanelMetricas<PuntoSerie>(this.ref, true);
  readonly serieZonas = new PanelMetricas<PuntoZona, PaginaOcupacionZonas>(this.ref, true);
  readonly recienteEstado = new RequestState(this.ref, true);
  readonly datosRecientes = signal<DatosOcupacionReciente | null>(null);
  readonly pronosticoRequest = new RequestState(this.ref, true);
  readonly pronostico = signal<DatosPronostico | null>(null);
  readonly actividad = new PanelMetricas<EstadoCamara>(this.ref, true);
  zonas: Zona[] = [];
  camaras: Camara[] = [];
  private readonly resumenDatos = signal<ResumenMetricas | null>(null);
  get resumen() { return this.resumenDatos(); }
  zonaSeleccionada = 0;
  camaraSeleccionada = 0;
  periodoTipo: 'hora' | 'dia' = 'hora';
  desde = addDays(limaToday(), -6);
  hasta = limaToday();
  errorFiltros = '';
  consulta: FiltrosMetricas | null = null;
  comparacionConsulta: FiltrosMetricas | null = null;
  agrupacion: AgrupacionOcupacion = 'camara';
  vistaOcupacion: VistaOcupacion = 'historico';
  readonly serieElegida = signal('');
  readonly fecha = mostrarFecha;
  readonly estadoMedicion = estadoMedicion;
  readonly estadoOperativo = estadoOperativo;

  get rangoAplicado() {
    const consulta = this.consulta;
    if (!consulta) return '';
    const inicio = consulta.desde.slice(0, 10);
    const fin = addDays(consulta.hasta.slice(0, 10), -1);
    const formatoDia = (dia: string) => dia.split('-').reverse().join('/');
    return inicio === fin ? formatoDia(inicio) : `${formatoDia(inicio)} al ${formatoDia(fin)}`;
  }
  get nombreCamaraSeleccionada() {
    return this.camaras.find((camara) => camara.id === this.consulta?.id_camara)?.nombre;
  }
  private readonly camarasHistoricas = computed(() => new Map(this.serie.filas.map((fila) => [claveSerieCamara(fila), fila])));
  private readonly camarasRecientes = computed(() => new Map((this.datosRecientes()?.datos ?? []).map((fila) => [claveSerieCamara(fila), fila])));
  get camarasSerie() { return this.vistaOcupacion === 'reciente' ? this.camarasRecientes() : this.camarasHistoricas(); }
  private readonly historicoVisible = computed(() => this.filtrarCamara(this.serie.filas));
  readonly ventanasVisibles = computed(() => this.filtrarCamara(this.datosRecientes()?.datos ?? []));
  get filasSerie() { return this.historicoVisible(); }
  get serieConMedicion() { return this.filasSerie.some((f) => f.promedio_presentes !== null); }
  get serieConMedicionParcial() {
    return this.filasSerie.some((f) => f.estado_ocupacion === 'datos_incompletos' && f.promedio_presentes !== null);
  }
  get serieSoloConteos() {
    const filas = this.filasSerie;
    return filas.length > 0 && filas.every((f) => f.estado_ocupacion === 'sin_datos');
  }
  get maximoVisible() {
    const valores = this.filasSerie.flatMap((f) => f.max_presentes === null ? [] : [f.max_presentes]);
    return valores.length ? Math.max(...valores) : null;
  }
  get estadoOcupacion() {
    if (this.agrupacion === 'zona') return this.serieZonas.estado;
    return this.vistaOcupacion === 'reciente' ? this.recienteEstado : this.serie.estado;
  }
  get hayMediciones() {
    if (this.agrupacion === 'zona') return this.serieZonas.filas.length > 0;
    return this.vistaOcupacion === 'reciente'
      ? this.ventanasVisibles().some((fila) => fila.promedio_presentes !== null) : this.serieConMedicion;
  }
  get mensajeVacio() {
    if (this.agrupacion === 'camara' && this.vistaOcupacion === 'historico' && this.filasSerie.length) {
      return this.serieSoloConteos ? 'No hay ocupación consolidada en la selección. Solo conteos históricos.'
        : 'No hay ocupación consolidada en la selección.';
    }
    return 'Sin datos para esta selección.';
  }
  ngOnInit() {
    this.cargar();
    const intervalo = this.config.pollMs * 2;
    timer(intervalo, intervalo).pipe(
      filter(() => !document.hidden && this.auth.validToken()),
      takeUntilDestroyed(this.ref),
    ).subscribe(() => this.refrescarMetricas());
  }
  cargar() {
    this.request.run(forkJoin({ zonas: this.zonasApi.listar(), camaras: this.camarasApi.listar() }), (d) => {
      this.zonas = d.zonas;
      this.camaras = d.camaras;
      if (this.zonaSeleccionada && !d.zonas.some((z) => z.id === this.zonaSeleccionada)) this.zonaSeleccionada = 0;
      this.buscar();
    });
  }
  cambiarZona(id: number) {
    this.zonaSeleccionada = id;
    if (id && !this.camaras.some((camara) => camara.id === this.camaraSeleccionada && camara.zonaId === id)) {
      this.camaraSeleccionada = 0;
    }
    this.buscar();
  }
  cambiarCamara(id: number) {
    this.camaraSeleccionada = id;
    this.buscar();
  }
  cambiarAgrupacion(agrupacion: AgrupacionOcupacion) {
    if (this.agrupacion === agrupacion) return;
    this.agrupacion = agrupacion;
    this.limpiarOcupacion();
    this.cargarOcupacion();
  }
  cambiarVista(vista: VistaOcupacion) {
    if (vista === this.vistaOcupacion) return;
    this.vistaOcupacion = vista;
    this.limpiarOcupacion();
    this.cargarOcupacion();
  }
  aplicarOpciones(opciones: OpcionesOcupacion) {
    this.desde = opciones.desde;
    this.hasta = opciones.hasta;
    this.periodoTipo = opciones.periodo;
    this.buscar();
  }
  buscar() {
    this.errorFiltros = '';
    if (!rangoValido(this.desde, this.hasta)) {
      this.limpiarConsulta();
      this.errorFiltros = 'Selecciona un rango válido de hasta 31 días, incluyendo ambas fechas.';
      return;
    }
    const consulta: FiltrosMetricas = { desde: this.desde + 'T00:00:00', hasta: exclusiveEnd(this.hasta)!, periodo: this.periodoTipo,
      id_zona: this.zonaSeleccionada || undefined,
      id_camara: this.camaraSeleccionada || undefined };
    if (JSON.stringify(consulta) === JSON.stringify(this.consulta)) {
      this.refrescarMetricas();
      return;
    }
    const anterior = this.consulta;
    this.consulta = consulta;
    this.limpiarOcupacion();
    this.cargarResumen(true);
    this.cargarOcupacion();
    if (!anterior || anterior.desde !== consulta.desde || anterior.hasta !== consulta.hasta ||
      anterior.periodo !== consulta.periodo) {
      this.comparacionConsulta = { desde: consulta.desde, hasta: consulta.hasta, periodo: consulta.periodo,
        tipo_fuente: 'stream' };
    }
    if (anterior?.id_camara !== consulta.id_camara) {
      this.pronosticoRequest.reiniciar();
      this.pronostico.set(null);
      this.cargarPronostico();
    }
    if (!anterior || anterior.id_camara !== consulta.id_camara || anterior.id_zona !== consulta.id_zona) {
      this.actividad.limpiar();
      this.cargarActividad();
    }
  }
  private limpiarConsulta() {
    this.comparacionConsulta = null;
    this.pronosticoRequest.reiniciar();
    this.pronostico.set(null);
    this.consulta = null;
    this.resumenEstado.reiniciar();
    this.resumenDatos.set(null);
    this.limpiarOcupacion();
    this.actividad.limpiar();
  }
  private limpiarOcupacion() {
    this.serie.limpiar();
    this.serieZonas.limpiar();
    this.recienteEstado.reiniciar();
    this.datosRecientes.set(null);
    this.serieElegida.set('');
  }
  refrescarMetricas() {
    if (!this.consulta) return;
    this.cargarResumen();
    if (this.agrupacion === 'zona') this.serieZonas.refrescar();
    else if (this.vistaOcupacion === 'reciente') {
      if (!this.recienteEstado.loading()) this.cargarOcupacion();
    } else this.serie.refrescar();
    this.actividad.refrescar();
    this.cargarPronostico();
  }
  cargarResumen(reemplazar = false) {
    if (this.consulta && (reemplazar || !this.resumenEstado.loading())) {
      this.resumenEstado.run(this.metricas.resumen(this.consulta), (r) => this.resumenDatos.set(r));
    }
  }
  cargarSerie(desplazamiento = 0) {
    if (!this.consulta) return;
    this.serie.cargar(this.metricas.series({ ...this.consulta, tipo_fuente: 'stream' }, desplazamiento), () => {
      this.seleccionarSerieVisible(this.serie.filas);
    });
  }
  cargarOcupacion(desplazamiento = 0) {
    if (!this.consulta) return;
    const consulta: FiltrosMetricas = { ...this.consulta, tipo_fuente: 'stream' };
    if (this.agrupacion === 'zona') {
      this.serieZonas.cargar(this.metricas.ocupacionZonas({ ...consulta, id_camara: undefined }, this.vistaOcupacion, desplazamiento, 300));
    } else if (this.vistaOcupacion === 'reciente') {
      this.recienteEstado.run(this.metricas.ocupacionReciente(consulta), (datos) => {
        this.datosRecientes.set(datos);
        this.seleccionarSerieVisible(datos.datos);
      });
    } else this.cargarSerie(desplazamiento);
  }
  reintentarOcupacion() {
    if (this.agrupacion === 'zona') this.serieZonas.reintentar();
    else if (this.vistaOcupacion === 'reciente') this.cargarOcupacion();
    else this.serie.reintentar();
  }
  private filtrarCamara<T extends PuntoSerie | VentanaOcupacion>(filas: T[]): T[] {
    const elegida = this.serieElegida();
    return elegida ? filas.filter((fila) => claveSerieCamara(fila) === elegida) : filas;
  }
  private seleccionarSerieVisible(filas: (PuntoSerie | VentanaOcupacion)[]) {
    const camaras = this.camarasSerie;
    if (camaras.size <= 8) this.serieElegida.set('');
    else if (!camaras.has(this.serieElegida())) {
      const medida = filas.find((fila) => fila.promedio_presentes !== null);
      this.serieElegida.set(medida ? claveSerieCamara(medida) : camaras.keys().next().value ?? '');
    }
  }
  cargarPronostico() {
    const id = this.consulta?.id_camara;
    if (id === undefined || this.pronosticoRequest.loading()) return;
    this.pronosticoRequest.run(this.monitoreo.pronostico(id), (datos) => this.pronostico.set(datos));
  }
  cargarActividad(desplazamiento = 0) {
    if (this.consulta) this.actividad.cargar(this.metricas.estadoCamaras({ id_zona: this.consulta.id_zona,
      id_camara: this.consulta.id_camara }, desplazamiento));
  }
  etiquetaSerie(fila: PuntoSerie | VentanaOcupacion) { return etiquetaEjecucion(fila, this.camaras); }
  etiquetaCamara(fila: PuntoSerie | VentanaOcupacion) { return nombreSerieCamara(fila, this.camaras); }
}
