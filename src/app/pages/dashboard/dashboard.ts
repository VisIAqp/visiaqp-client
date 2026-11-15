import { AfterViewInit, Component, DestroyRef, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { filter, forkJoin, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Chart } from 'chart.js/auto';
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
import { EstadoCamara, FiltrosMetricas, PuntoSerie, ResumenMetricas } from '../../core/models/metricas.model';
import { PronosticoOcupacion as DatosPronostico } from '../../core/models/pronostico.model';
import { MonitoreoService } from '../../core/services/monitoreo';
import { GraficoZonas } from '../../shared/grafico-zonas/grafico-zonas';
import { PronosticoOcupacion } from '../../shared/pronostico-ocupacion/pronostico-ocupacion';
import { alternarCamara, camarasOcultas, claveSerieCamara, detalleEjecucion, estiloCamara, etiquetasCamaras, nombreSerieCamara } from '../../shared/graficos/ocupacion-estilo';
import { AgrupacionOcupacion, FiltrosOcupacion, FuenteOcupacion, OpcionesOcupacion, VistaOcupacion } from './filtros-ocupacion/filtros-ocupacion';
import { OcupacionReciente } from './ocupacion-reciente/ocupacion-reciente';
import { addDays, exclusiveEnd, limaToday } from '../../core/api/dates';
import { estadoMedicion, estadoOperativo, etiquetaEjecucion, mostrarFecha, prepararSeries, rangoValido } from '../../core/api/metricas-presentacion';

@Component({
  selector: 'app-dashboard', imports: [CommonModule, FormsModule, RouterLink, ApiState, Pagination, OcupacionReciente, GraficoZonas, PronosticoOcupacion, FiltrosOcupacion],
  templateUrl: './dashboard.html',
  host: { class: 'block' },
})
export class Dashboard implements OnInit, AfterViewInit, OnDestroy {
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
  readonly pronosticoRequest = new RequestState(this.ref, true);
  readonly pronostico = signal<DatosPronostico | null>(null);
  readonly actividad = new PanelMetricas<EstadoCamara>(this.ref, true);
  private readonly paneles = [this.serie, this.actividad];
  zonas: Zona[] = [];
  camaras: Camara[] = [];
  private readonly resumenDatos = signal<ResumenMetricas | null>(null);
  get resumen() { return this.resumenDatos(); }
  zonaSeleccionada = 0;
  camaraSeleccionada = 0;
  fuente: FuenteOcupacion = '';
  periodoTipo: 'hora' | 'dia' = 'hora';
  desde = addDays(limaToday(), -6);
  hasta = limaToday();
  errorFiltros = '';
  consulta: FiltrosMetricas | null = null;
  comparacionConsulta: FiltrosMetricas | null = null;
  agrupacion: AgrupacionOcupacion = 'camara';
  vistaOcupacion: VistaOcupacion = 'historico';
  serieElegida = '';
  readonly fecha = mostrarFecha;
  readonly estadoMedicion = estadoMedicion;
  readonly estadoOperativo = estadoOperativo;
  @ViewChild('serieCanvas') serieCanvas!: ElementRef<HTMLCanvasElement>;
  private graficoSerie?: Chart<'line', (number | null)[], string>;

  get rangoAplicado() {
    const consulta = this.consulta;
    if (!consulta) return '';
    const inicio = consulta.desde.slice(0, 10);
    const fin = addDays(consulta.hasta.slice(0, 10), -1);
    const formatoDia = (dia: string) => dia.split('-').reverse().join('/');
    return inicio === fin ? formatoDia(inicio) : `${formatoDia(inicio)} al ${formatoDia(fin)}`;
  }
  get camarasSerie() {
    return new Map(this.serie.filas.map((fila) => [claveSerieCamara(fila), fila]));
  }
  get filasSerie() { return this.serieElegida ? this.serie.filas.filter((f) => claveSerieCamara(f) === this.serieElegida) : this.serie.filas; }
  get filasTablaSerie() { return this.filasSerie; }
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
  ngOnInit() {
    this.cargar();
    const intervalo = this.config.pollMs * 2;
    timer(intervalo, intervalo).pipe(
      filter(() => !document.hidden && this.auth.validToken()),
      takeUntilDestroyed(this.ref),
    ).subscribe(() => this.refrescarMetricas());
  }
  ngAfterViewInit() {
    this.graficoSerie = new Chart<'line', (number | null)[], string>(this.serieCanvas.nativeElement, {
      type: 'line', data: { labels: [], datasets: [] },
      options: { responsive: true, maintainAspectRatio: false, spanGaps: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, generateLabels: etiquetasCamaras }, onClick: alternarCamara },
          tooltip: { callbacks: { afterLabel: detalleEjecucion } },
        },
        scales: { y: { beginAtZero: true, title: { display: true, text: 'Personas presentes' } },
          x: { ticks: { maxTicksLimit: 8 } } } },
    });
    this.actualizarSerie();
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
    this.buscar();
  }
  aplicarOpciones(opciones: OpcionesOcupacion) {
    this.desde = opciones.desde;
    this.hasta = opciones.hasta;
    this.periodoTipo = opciones.periodo;
    this.fuente = opciones.fuente;
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
      id_camara: this.agrupacion === 'camara' ? this.camaraSeleccionada || undefined : undefined,
      tipo_fuente: this.fuente || undefined };
    if (JSON.stringify(consulta) === JSON.stringify(this.consulta)) {
      this.refrescarMetricas();
      return;
    }
    const anterior = this.consulta;
    this.consulta = consulta;
    this.resumenEstado.reiniciar();
    this.resumenDatos.set(null);
    this.serie.limpiar();
    this.serieElegida = '';
    this.actualizarSerie();
    this.cargarResumen();
    this.cargarSerie();
    if (!anterior || anterior.desde !== consulta.desde || anterior.hasta !== consulta.hasta ||
      anterior.periodo !== consulta.periodo || anterior.tipo_fuente !== consulta.tipo_fuente) {
      this.comparacionConsulta = { desde: consulta.desde, hasta: consulta.hasta, periodo: consulta.periodo,
        tipo_fuente: consulta.tipo_fuente };
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
    this.serieElegida = '';
    for (const panel of this.paneles) panel.limpiar();
    this.actualizarSerie();
  }
  refrescarMetricas() {
    if (!this.consulta) return;
    this.cargarResumen();
    for (const panel of this.paneles) panel.refrescar();
    this.cargarPronostico();
  }
  cargarResumen() {
    if (this.consulta && !this.resumenEstado.loading()) {
      this.resumenEstado.run(this.metricas.resumen(this.consulta), (r) => this.resumenDatos.set(r));
    }
  }
  cargarSerie(desplazamiento = 0) {
    if (!this.consulta) return;
    this.serie.cargar(this.metricas.series(this.consulta, desplazamiento), () => {
      const camaras = this.camarasSerie;
      if (camaras.size <= 8) this.serieElegida = '';
      else if (!camaras.has(this.serieElegida)) {
        const medida = this.serie.filas.find((fila) => fila.promedio_presentes !== null);
        this.serieElegida = medida ? claveSerieCamara(medida) : camaras.keys().next().value ?? '';
      }
      this.actualizarSerie();
    });
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
  etiquetaSerie(fila: PuntoSerie) { return etiquetaEjecucion(fila, this.camaras); }
  etiquetaCamara(fila: PuntoSerie) { return nombreSerieCamara(fila, this.camaras); }
  actualizarSerie() {
    if (!this.graficoSerie) return;
    const preparada = prepararSeries(this.filasSerie, this.consulta?.periodo ?? this.periodoTipo);
    const estilos = getComputedStyle(this.serieCanvas.nativeElement);
    const ocultas = camarasOcultas(this.graficoSerie);
    this.graficoSerie.data = { labels: preparada.labels, datasets: preparada.series.map((s) => {
      const estilo = estiloCamara(this.filasSerie.find((f) => f.id_procesamiento === s.id)!, this.camaras, estilos);
      return { ...estilo, data: s.datos, hidden: ocultas.has(estilo.claveCamara),
        pointRadius: preparada.labels.length > 100 ? 0 : 2, borderWidth: 2, tension: 0, spanGaps: false };
    }) };
    this.graficoSerie.update('none');
  }
  ngOnDestroy() { this.graficoSerie?.destroy(); }
}
