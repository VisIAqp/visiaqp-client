import { DecimalPipe } from '@angular/common';
import { AfterViewInit, Component, DestroyRef, effect, ElementRef, inject, input, OnDestroy, OnInit, untracked, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Chart } from 'chart.js/auto';
import { filter, timer } from 'rxjs';
import { API_CONFIG } from '../../core/api/api-config';
import { fechaMetrica, mostrarFecha } from '../../core/api/metricas-presentacion';
import { PanelMetricas } from '../../core/api/panel-metricas';
import { Auth } from '../../core/auth/auth';
import { FiltrosMetricas, PuntoZona } from '../../core/models/metricas.model';
import { MetricasService } from '../../core/services/metricas';
import { ApiState } from '../api-state/api-state';
import { colorOcupacion } from '../graficos/ocupacion-estilo';
import { Pagination } from '../pagination/pagination';

type Vista = 'historico' | 'reciente' | 'comparacion';
type Punto = { x: number; y: number | null };

@Component({
  selector: 'app-grafico-zonas',
  imports: [ApiState, DecimalPipe, Pagination],
  templateUrl: './grafico-zonas.html',
})
export class GraficoZonas implements OnInit, AfterViewInit, OnDestroy {
  readonly filtros = input.required<FiltrosMetricas>();
  readonly vista = input.required<Vista>();
  readonly breve = input(false);
  readonly actualizacionAutomatica = input(false);
  private readonly api = inject(MetricasService);
  private readonly auth = inject(Auth);
  private readonly config = inject(API_CONFIG);
  private readonly ref = inject(DestroyRef);
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private grafico?: Chart<'bar' | 'line', Punto[]>;
  readonly panel = new PanelMetricas<PuntoZona>(this.ref, true);
  readonly fecha = mostrarFecha;
  private readonly formatoHora = new Intl.DateTimeFormat('es-PE', {
    timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  });

  constructor() {
    effect(() => {
      const filtros = this.filtros();
      const vista = this.vista();
      const breve = this.breve();
      untracked(() => {
        this.panel.limpiar();
        this.cargar(0, filtros, vista, breve);
      });
    });
  }

  ngOnInit() {
    const intervalo = this.config.pollMs * 2;
    timer(intervalo, intervalo).pipe(
      filter(() => this.actualizacionAutomatica() && !document.hidden && this.auth.validToken()),
      takeUntilDestroyed(this.ref),
    ).subscribe(() => this.panel.refrescar());
  }

  cargar(desplazamiento = 0, filtros = this.filtros(), vista = this.vista(), breve = this.breve()) {
    const limite = vista === 'comparacion' ? (breve ? 5 : 20) : 300;
    this.panel.cargar(this.api.ocupacionZonas(filtros, vista, desplazamiento, limite), () => this.dibujar());
  }

  ngAfterViewInit() {
    const barras = this.vista() === 'comparacion';
    this.grafico = new Chart<'bar' | 'line', Punto[]>(this.canvas().nativeElement, {
      type: barras ? 'bar' : 'line', data: { datasets: [] },
      options: {
        responsive: true, maintainAspectRatio: false, parsing: false, animation: false,
        scales: {
          x: barras ? { type: 'category' } : {
            type: 'linear', ticks: { maxTicksLimit: 7, callback: (valor) => this.vista() === 'reciente'
              ? this.formatoHora.format(Number(valor)) : mostrarFecha(new Date(Number(valor)).toISOString()) },
          },
          y: { beginAtZero: true, title: { display: true, text: 'Personas en promedio por cámara' } },
        },
        plugins: { legend: { display: !barras, position: 'bottom' }, tooltip: { callbacks: {
          title: ([item]) => !item || item.parsed.x === null ? '' : barras ? item.label
            : mostrarFecha(new Date(item.parsed.x).toISOString()),
        } } },
      },
    });
    this.dibujar();
  }

  private dibujar() {
    const grafico = this.grafico;
    if (!grafico) return;
    const filas = this.panel.filas;
    const estilos = getComputedStyle(this.canvas().nativeElement);
    if (this.vista() === 'comparacion') {
      grafico.data = { labels: filas.map((f) => f.nombre_zona), datasets: [{
        label: 'Promedio por cámara', data: filas.map((f, x) => ({ x, y: f.promedio_presentes })),
        backgroundColor: filas.map((f) => colorOcupacion(estilos, f.id_zona)),
      }] };
    } else {
      const grupos = new Map<number, PuntoZona[]>();
      for (const fila of filas) {
        const grupo = grupos.get(fila.id_zona);
        if (grupo) grupo.push(fila);
        else grupos.set(fila.id_zona, [fila]);
      }
      const paso = this.vista() === 'reciente' ? 60000 : this.filtros().periodo === 'hora' ? 3600000 : 86400000;
      grafico.data = { datasets: [...grupos.values()].map((grupo) => {
        const datos: Punto[] = [];
        let anterior: number | undefined;
        for (const fila of grupo.sort((a, b) => a.periodo_inicio.localeCompare(b.periodo_inicio))) {
          const x = fechaMetrica(fila.periodo_inicio).getTime();
          if (anterior !== undefined && x - anterior > paso) datos.push({ x: anterior + paso, y: null });
          datos.push({ x, y: fila.promedio_presentes });
          anterior = x;
        }
        const color = colorOcupacion(estilos, grupo[0].id_zona);
        return { label: grupo[0].nombre_zona, data: datos, borderColor: color, backgroundColor: color,
          pointRadius: datos.length > 100 ? 1 : 3, spanGaps: false };
      }) };
      const eje = grafico.options.scales!['x']!;
      const tiempos = grafico.data.datasets.flatMap((dataset) => dataset.data.map((p) => p.x));
      if (tiempos.length) {
        eje.min = Math.min(...tiempos);
        eje.max = Math.max(eje.min + paso, ...tiempos);
      }
    }
    grafico.update('none');
  }

  ngOnDestroy() { this.grafico?.destroy(); }
}
