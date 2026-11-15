import { DecimalPipe } from '@angular/common';
import { AfterViewInit, Component, computed, DestroyRef, effect, ElementRef, inject, input, OnDestroy, OnInit, signal, untracked, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Chart } from 'chart.js/auto';
import { filter, timer } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api-config';
import { etiquetaEjecucion, fechaMetrica } from '../../../core/api/metricas-presentacion';
import { RequestState } from '../../../core/api/request-state';
import { Auth } from '../../../core/auth/auth';
import { Camara } from '../../../core/models/camara.model';
import { DatosOcupacionReciente, FiltrosOrigenMetricas, VentanaOcupacion } from '../../../core/models/metricas.model';
import { MetricasService } from '../../../core/services/metricas';
import { ApiState } from '../../../shared/api-state/api-state';
import { alternarCamara, camarasOcultas, detalleEjecucion, estiloCamara, etiquetasCamaras } from '../../../shared/graficos/ocupacion-estilo';

interface PuntoVentana {
  x: number;
  y: number | null;
}

const pausaMaximaMs = 5000;

@Component({
  selector: 'app-ocupacion-reciente',
  imports: [ApiState, DecimalPipe, FormsModule],
  templateUrl: './ocupacion-reciente.html',
})
export class OcupacionReciente implements OnInit, AfterViewInit, OnDestroy {
  readonly filtros = input.required<FiltrosOrigenMetricas>();
  readonly camaras = input.required<readonly Camara[]>();
  private readonly metricas = inject(MetricasService);
  private readonly auth = inject(Auth);
  private readonly config = inject(API_CONFIG);
  private readonly ref = inject(DestroyRef);
  readonly request = new RequestState(this.ref, true);
  readonly datos = signal<DatosOcupacionReciente | null>(null);
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private grafico?: Chart<'line', PuntoVentana[]>;

  readonly formatoHora = new Intl.DateTimeFormat('es-PE', {
    timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  });
  private readonly formatoVentana = new Intl.DateTimeFormat('es-PE', {
    timeZone: 'America/Lima', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    second: '2-digit', hourCycle: 'h23',
  });
  readonly maxSeries = 8;
  readonly ejecucionElegida = signal<number | null>(null);
  readonly grupos = computed(() => {
    const grupos = new Map<number, VentanaOcupacion[]>();
    for (const ventana of this.datos()?.datos ?? []) {
      const grupo = grupos.get(ventana.id_procesamiento);
      if (grupo) grupo.push(ventana);
      else grupos.set(ventana.id_procesamiento, [ventana]);
    }
    return grupos;
  });
  readonly ejecuciones = computed(() => [...this.grupos().values()].map((grupo) => grupo[0]));
  readonly seleccion = computed(() => {
    const elegida = this.ejecucionElegida();
    if (elegida !== null && this.grupos().has(elegida)) return elegida;
    if (this.grupos().size <= this.maxSeries) return null;
    const ventanas = this.datos()?.datos ?? [];
    const reciente = ventanas.filter((ventana) => ventana.promedio_presentes !== null).at(-1) ?? ventanas.at(-1);
    return reciente?.id_procesamiento ?? null;
  });
  readonly filas = computed(() => {
    const seleccion = this.seleccion();
    return seleccion === null ? this.datos()?.datos ?? [] : this.grupos().get(seleccion) ?? [];
  });
  readonly puntosMedidos = computed(() => this.filas().filter((ventana) => ventana.promedio_presentes !== null).length);

  constructor() {
    effect(() => {
      const filtros = this.filtros();
      untracked(() => {
        this.request.reiniciar();
        this.datos.set(null);
        this.ejecucionElegida.set(null);
        this.cargar(filtros);
      });
    });
    effect(() => this.actualizarGrafico(this.datos(), this.grupos(), this.seleccion(), this.camaras()));
  }

  ngOnInit() {
    const intervalo = this.config.pollMs * 2;
    timer(intervalo, intervalo).pipe(
      filter(() => !document.hidden && this.auth.validToken()), takeUntilDestroyed(this.ref),
    ).subscribe(() => this.cargar());
  }

  cargar(filtros = this.filtros()) {
    if (this.request.loading()) return;
    this.request.run(this.metricas.ocupacionReciente(filtros), (datos) => this.datos.set(datos));
  }

  ngAfterViewInit() {
    this.grafico = new Chart<'line', PuntoVentana[]>(this.canvas().nativeElement, {
      type: 'line', data: { datasets: [] },
      options: {
        parsing: false, responsive: true, maintainAspectRatio: false, animation: false,
        scales: {
          x: { type: 'linear', ticks: { maxTicksLimit: 8, callback: (valor) => this.formatoHora.format(Number(valor)) } },
          y: { beginAtZero: true, title: { display: true, text: 'Personas presentes en promedio' } },
        },
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, generateLabels: etiquetasCamaras }, onClick: alternarCamara },
          tooltip: { callbacks: { afterLabel: detalleEjecucion, title: ([punto]) => {
            const instante = punto?.parsed.x;
            return instante == null ? '' : this.formatoVentana.format(instante);
          } } },
        },
      },
    });
    this.actualizarGrafico(this.datos(), this.grupos(), this.seleccion(), this.camaras());
  }

  ngOnDestroy() { this.grafico?.destroy(); }

  etiqueta(ventana: VentanaOcupacion) { return etiquetaEjecucion(ventana, this.camaras()); }

  fecha(valor: string) { return this.formatoVentana.format(fechaMetrica(valor)); }

  private actualizarGrafico(datos: DatosOcupacionReciente | null, grupos: Map<number, VentanaOcupacion[]>,
    seleccion: number | null, camaras: readonly Camara[]) {
    const grafico = this.grafico;
    if (!grafico || !datos) return;
    const estilos = getComputedStyle(this.canvas().nativeElement);
    const ocultas = camarasOcultas(grafico);
    const visibles = seleccion === null ? [...grupos.values()] : [grupos.get(seleccion) ?? []];
    grafico.data.datasets = visibles.filter((grupo) => grupo.length > 0).map((ventanas) => {
      const puntos: PuntoVentana[] = [];
      let finAnterior: number | undefined;
      for (const ventana of ventanas) {
        const inicio = fechaMetrica(ventana.periodo_inicio).getTime();
        // La ventana siguiente empieza en el siguiente frame. Solo corta el trazo ante una pausa prolongada.
        if (finAnterior !== undefined && inicio - finAnterior > pausaMaximaMs) {
          puntos.push({ x: (finAnterior + inicio) / 2, y: null });
        }
        puntos.push({ x: inicio, y: ventana.promedio_presentes });
        finAnterior = fechaMetrica(ventana.periodo_fin).getTime();
      }
      const estilo = estiloCamara(ventanas[0], camaras, estilos);
      return { ...estilo, data: puntos, hidden: ocultas.has(estilo.claveCamara),
        borderWidth: 2, pointRadius: puntos.length > 100 ? 1 : 3, spanGaps: false };
    });
    const fin = fechaMetrica(datos.hasta).getTime();
    const inicioRango = fechaMetrica(datos.desde).getTime();
    const primerPunto = Math.min(...visibles.filter((grupo) => grupo.length).map((grupo) =>
      fechaMetrica(grupo[0].periodo_inicio).getTime()));
    const eje = grafico.options.scales!['x']!;
    eje.min = Math.max(inicioRango, Math.min(primerPunto, fin - 5 * 60000));
    eje.max = fin;
    grafico.update('none');
  }
}
