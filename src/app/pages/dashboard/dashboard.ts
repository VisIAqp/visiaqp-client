import { AfterViewInit, Component, DestroyRef, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { filter, forkJoin, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Contexto } from '../contexto/contexto';
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
import { DistribucionNivel, EstadoCamara, FiltrosMetricas, MedicionAgregada, PatronHorario,
  PuntoSerie, ResumenMetricas } from '../../core/models/metricas.model';
import { addDays, exclusiveEnd, limaToday } from '../../core/api/dates';
import { estadoMedicion, estadoOperativo, mostrarFecha, prepararSeries, rangoValido } from '../../core/api/metricas-presentacion';

@Component({
  selector: 'app-dashboard', imports: [CommonModule, FormsModule, RouterLink, ApiState, Pagination, Contexto],
  templateUrl: './dashboard.html',
  host: { class: 'block' },
})
export class Dashboard implements OnInit, AfterViewInit, OnDestroy {
  private zonasApi = inject(ZonaService);
  private camarasApi = inject(CamaraService);
  private metricas = inject(MetricasService);
  private auth = inject(Auth);
  private config = inject(API_CONFIG);
  private ref = inject(DestroyRef);
  readonly request = new RequestState(this.ref);
  readonly resumenEstado = new RequestState(this.ref, true);
  readonly serie = new PanelMetricas<PuntoSerie>(this.ref, true);
  readonly comparativa = new PanelMetricas<MedicionAgregada>(this.ref, true);
  readonly patron = new PanelMetricas<PatronHorario>(this.ref, true);
  readonly niveles = new PanelMetricas<DistribucionNivel>(this.ref, true);
  readonly actividad = new PanelMetricas<EstadoCamara>(this.ref, true);
  private readonly paneles = [this.serie, this.comparativa, this.patron, this.niveles, this.actividad];
  zonas: Zona[] = [];
  camaras: Camara[] = [];
  private readonly resumenDatos = signal<ResumenMetricas | null>(null);
  get resumen() { return this.resumenDatos(); }
  zonaSeleccionada = 0;
  camaraSeleccionada = 0;
  ejecucionId: number | null = null;
  fuente: '' | 'imagen' | 'video' | 'stream' = '';
  periodoTipo: 'hora' | 'dia' = 'hora';
  desde = addDays(limaToday(), -6);
  hasta = limaToday();
  errorFiltros = '';
  consulta: FiltrosMetricas | null = null;
  verContexto = false;
  serieElegida = 0;
  zonaPatron = 0;
  readonly dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  readonly horas = Array.from({ length: 24 }, (_, i) => i);
  readonly fecha = mostrarFecha;
  readonly estadoMedicion = estadoMedicion;
  readonly estadoOperativo = estadoOperativo;
  @ViewChild('serieCanvas') serieCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('comparativaCanvas') comparativaCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('nivelesCanvas') nivelesCanvas!: ElementRef<HTMLCanvasElement>;
  private graficoSerie?: Chart<'line', (number | null)[], string>;
  private graficoComparativa?: Chart<'bar', (number | null)[], string>;
  private graficoNiveles?: Chart<'doughnut', number[], string>;

  get camarasFiltradas() { return this.camaras.filter((c) => !this.zonaSeleccionada || c.zonaId === this.zonaSeleccionada); }
  get rangoAplicado() {
    const consulta = this.consulta;
    if (!consulta) return '';
    const inicio = consulta.desde.slice(0, 10);
    const fin = addDays(consulta.hasta.slice(0, 10), -1);
    const formatoDia = (dia: string) => dia.split('-').reverse().join('/');
    return inicio === fin ? formatoDia(inicio) : `${formatoDia(inicio)} al ${formatoDia(fin)}`;
  }
  get filtrosAplicados() {
    const consulta = this.consulta;
    if (!consulta) return [];
    const zona = this.zonas.find((z) => z.id === consulta.id_zona)?.nombre;
    const camara = this.camaras.find((c) => c.id === consulta.id_camara)?.nombre;
    const fuentes = { stream: 'Transmisiones', video: 'Videos', imagen: 'Imágenes' };
    const filtros = [
      zona ?? 'Todas las zonas',
      camara ?? 'Todas las cámaras',
      consulta.tipo_fuente ? fuentes[consulta.tipo_fuente] : 'Todas las fuentes',
      consulta.periodo === 'hora' ? 'Por hora' : 'Por día',
    ];
    if (consulta.id_procesamiento) filtros.push(`Ejecución #${consulta.id_procesamiento}`);
    return filtros;
  }
  get ejecucionesSerie() {
    return [...new Map(this.serie.filas.map((f) => [f.id_procesamiento, f])).values()];
  }
  get zonasPatron() { return [...new Map(this.patron.filas.map((f) => [f.id_zona, f.nombre_zona])).entries()]; }
  get filasSerie() { return this.serieElegida ? this.serie.filas.filter((f) => f.id_procesamiento === this.serieElegida) : this.serie.filas; }
  get filasTablaSerie() { return this.filasSerie; }
  get serieConMedicion() { return this.filasSerie.some((f) => f.promedio_presentes !== null); }
  get serieSoloConteos() {
    const filas = this.filasSerie;
    return filas.length > 0 && filas.every((f) => f.estado_ocupacion === 'sin_datos');
  }
  get maximoVisible() {
    const valores = this.filasSerie.flatMap((f) => f.max_presentes === null ? [] : [f.max_presentes]);
    return valores.length ? Math.max(...valores) : null;
  }
  get comparativaConMedicion() { return this.comparativa.filas.some((f) => f.promedio_presentes !== null); }
  get distribucionVisible() {
    const orden = ['bajo', 'medio', 'alto', 'sin_datos', 'datos_incompletos', 'fuentes_sin_consolidar', 'ejecuciones_sin_consolidar'];
    const conteos = new Map<string, number>();
    // Se suman únicamente los periodos ya agregados de la página visible.
    for (const fila of this.niveles.filas) {
      const clave = fila.nivel_ocupacion ?? (fila.estado_ocupacion === 'disponible' ? 'sin_nivel' : fila.estado_ocupacion);
      conteos.set(clave, (conteos.get(clave) ?? 0) + fila.cantidad_periodos);
    }
    return [...orden.filter((clave) => conteos.has(clave)), ...[...conteos.keys()].filter((clave) => !orden.includes(clave))].map((clave) => ({ clave,
      nombre: clave === 'sin_nivel' ? 'Medición sin nivel' : ['bajo', 'medio', 'alto'].includes(clave) ? clave : estadoMedicion(clave),
      cantidad: conteos.get(clave)! }));
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
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } } },
        scales: { y: { beginAtZero: true, title: { display: true, text: 'Personas presentes' } },
          x: { ticks: { maxTicksLimit: 8 } } } },
    });
    this.graficoComparativa = new Chart<'bar', (number | null)[], string>(this.comparativaCanvas.nativeElement, {
      type: 'bar', data: { labels: [], datasets: [{ label: 'Ocupación promedio', data: [] }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true }, x: { ticks: { maxRotation: 35 } } } },
    });
    this.graficoNiveles = new Chart<'doughnut', number[], string>(this.nivelesCanvas.nativeElement, {
      type: 'doughnut', data: { labels: [], datasets: [{ data: [] }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } },
    });
    this.actualizarGraficos();
  }
  cargar() {
    this.request.run(forkJoin({ zonas: this.zonasApi.listar(), camaras: this.camarasApi.listar() }), (d) => {
      this.zonas = d.zonas;
      this.camaras = d.camaras;
      if (this.zonaSeleccionada && !d.zonas.some((z) => z.id === this.zonaSeleccionada)) this.zonaSeleccionada = 0;
      this.buscar();
    });
  }
  cambiarZona() { this.camaraSeleccionada = 0; this.ejecucionId = null; }
  buscar() {
    this.errorFiltros = '';
    if (!rangoValido(this.desde, this.hasta)) {
      this.limpiarConsulta();
      this.errorFiltros = 'Selecciona un rango válido de hasta 31 días, incluyendo ambas fechas.';
      return;
    }
    if (this.ejecucionId !== null && (!Number.isInteger(this.ejecucionId) || this.ejecucionId < 1)) {
      this.limpiarConsulta();
      this.errorFiltros = 'El identificador de ejecución debe ser un entero positivo o quedar vacío.';
      return;
    }
    const consulta: FiltrosMetricas = { desde: this.desde + 'T00:00:00', hasta: exclusiveEnd(this.hasta)!, periodo: this.periodoTipo,
      id_zona: this.zonaSeleccionada || undefined, id_camara: this.camaraSeleccionada || undefined,
      id_procesamiento: this.ejecucionId ?? undefined, tipo_fuente: this.fuente || undefined };
    if (JSON.stringify(consulta) === JSON.stringify(this.consulta)) {
      this.refrescarMetricas();
      return;
    }
    this.limpiarConsulta();
    this.consulta = consulta;
    this.cargarResumen();
    this.cargarSerie();
    this.cargarComparativa();
    this.cargarPatron();
    this.cargarNiveles();
    this.cargarActividad();
  }
  private limpiarConsulta() {
    this.verContexto = false;
    this.consulta = null;
    this.resumenEstado.reiniciar();
    this.resumenDatos.set(null);
    for (const panel of this.paneles) panel.limpiar();
    this.actualizarGraficos();
  }
  refrescarMetricas() {
    if (!this.consulta) return;
    this.cargarResumen();
    for (const panel of this.paneles) panel.refrescar();
  }
  cargarResumen() {
    if (this.consulta && !this.resumenEstado.loading()) {
      this.resumenEstado.run(this.metricas.resumen(this.consulta), (r) => this.resumenDatos.set(r));
    }
  }
  cargarSerie(desplazamiento = 0) {
    if (!this.consulta) return;
    this.serie.cargar(this.metricas.series(this.consulta, desplazamiento), () => {
      const ids = this.ejecucionesSerie.map((f) => f.id_procesamiento);
      if (this.serie.pagina && ((this.serieElegida && !ids.includes(this.serieElegida)) || (!this.serieElegida && ids.length > 8))) this.serieElegida = ids[0] ?? 0;
      this.actualizarSerie();
    });
  }
  cargarComparativa(desplazamiento = 0) {
    if (this.consulta) this.comparativa.cargar(this.metricas.comparativas(this.consulta, desplazamiento), () => this.actualizarComparativa());
  }
  cargarPatron(desplazamiento = 0) {
    if (this.consulta) this.patron.cargar(this.metricas.patrones(this.consulta, desplazamiento), () => {
      if (this.patron.pagina && !this.zonasPatron.some(([id]) => id === this.zonaPatron)) this.zonaPatron = this.zonasPatron[0]?.[0] ?? 0;
    });
  }
  cargarNiveles(desplazamiento = 0) {
    if (this.consulta) this.niveles.cargar(this.metricas.distribucion(this.consulta, desplazamiento), () => this.actualizarNiveles());
  }
  cargarActividad(desplazamiento = 0) {
    if (this.consulta) this.actividad.cargar(this.metricas.estadoCamaras({ id_zona: this.consulta.id_zona,
      id_camara: this.consulta.id_camara }, desplazamiento));
  }
  etiquetaSerie(fila: PuntoSerie) {
    const camara = this.camaras.find((c) => c.id === fila.id_camara)?.nombre ?? 'Sin cámara';
    return `${fila.nombre_zona} · ${camara} · ${fila.tipo_fuente} #${fila.id_procesamiento}`;
  }
  actualizarSerie() {
    if (!this.graficoSerie) return;
    const preparada = prepararSeries(this.filasSerie, this.consulta?.periodo ?? this.periodoTipo);
    const colores = this.colores();
    this.graficoSerie.data = { labels: preparada.labels, datasets: preparada.series.map((s, i) => ({
      label: this.etiquetaSerie(this.filasSerie.find((f) => f.id_procesamiento === s.id)!), data: s.datos,
      borderColor: colores[i % colores.length], backgroundColor: colores[i % colores.length],
      pointRadius: preparada.labels.length > 100 ? 0 : 2, borderWidth: 2, tension: 0, spanGaps: false,
    })) };
    this.graficoSerie.update('none');
  }
  private colores() {
    const estilo = getComputedStyle(document.documentElement);
    return ['brand', 'success', 'warning', 'danger', 'muted', 'maintenance', 'heading', 'subtle']
      .map((n) => estilo.getPropertyValue('--color-' + n).trim() || '#333');
  }
  private actualizarComparativa() {
    if (!this.graficoComparativa) return;
    this.graficoComparativa.data.labels = this.comparativa.filas.map((f) => f.nombre_zona);
    this.graficoComparativa.data.datasets[0].data = this.comparativa.filas.map((f) => f.promedio_presentes);
    this.graficoComparativa.data.datasets[0].backgroundColor = this.colores()[0];
    this.graficoComparativa.update('none');
  }
  private actualizarNiveles() {
    if (!this.graficoNiveles) return;
    this.graficoNiveles.data.labels = this.distribucionVisible.map((f) => f.nombre);
    this.graficoNiveles.data.datasets[0].data = this.distribucionVisible.map((f) => f.cantidad);
    const colores: Record<string, string> = { bajo: 'var(--color-success)', medio: 'var(--color-warning)', alto: 'var(--color-danger)' };
    const estilo = getComputedStyle(document.documentElement);
    this.graficoNiveles.data.datasets[0].backgroundColor = this.distribucionVisible.map((f) =>
      colores[f.clave] ? estilo.getPropertyValue('--color-' + ({ bajo: 'success', medio: 'warning', alto: 'danger' }[f.clave as 'bajo' | 'medio' | 'alto'])).trim() || '#777' : '#aaa');
    this.graficoNiveles.update('none');
  }
  private actualizarGraficos() { this.actualizarSerie(); this.actualizarComparativa(); this.actualizarNiveles(); }
  celda(dia: number, hora: number) { return this.patron.filas.find((f) => f.id_zona === this.zonaPatron && f.dia_semana === dia && f.hora === hora); }
  claseCelda(fila: PatronHorario | undefined) {
    if (!fila || fila.promedio_presentes === null) return 'bg-canvas text-muted';
    const estilos = {
      bajo: 'nivel-bajo bg-success-soft text-success',
      medio: 'bg-warning-soft text-warning',
      alto: 'bg-danger-soft text-danger',
    };
    return fila.nivel_ocupacion ? estilos[fila.nivel_ocupacion] : 'bg-canvas text-content';
  }
  descripcionCelda(dia: number, hora: number) {
    const fila = this.celda(dia, hora);
    return `${this.dias[dia]} ${hora}:00: ${fila ? estadoMedicion(fila.estado_ocupacion) + (fila.promedio_presentes !== null ? ', ' + fila.promedio_presentes + ' personas presentes en promedio' : '') : 'Sin grupo en esta página'}`;
  }
  ngOnDestroy() { this.graficoSerie?.destroy(); this.graficoComparativa?.destroy(); this.graficoNiveles?.destroy(); }
}
