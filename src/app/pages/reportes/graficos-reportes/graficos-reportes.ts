import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { AfterViewInit, Component, computed, DestroyRef, effect, ElementRef, inject, input, OnDestroy, signal, untracked, viewChild } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { estadoMedicion } from '../../../core/api/metricas-presentacion';
import { RequestState } from '../../../core/api/request-state';
import { IndicadorPeriodo } from '../../../core/models/indicador.model';
import { FiltrosMetricas, PatronZona } from '../../../core/models/metricas.model';
import { MetricasService } from '../../../core/services/metricas';
import { ApiState } from '../../../shared/api-state/api-state';
import { GraficoZonas } from '../../../shared/grafico-zonas/grafico-zonas';
import { Contexto } from '../../contexto/contexto';

const estilosNivel = {
  bajo: 'bg-success-soft text-success', medio: 'bg-warning-soft text-warning', alto: 'bg-danger-soft text-danger',
};
const coloresNivel: Record<string, string> = { bajo: 'success', medio: 'warning', alto: 'danger' };

@Component({
  selector: 'app-graficos-reportes',
  imports: [ApiState, Contexto, DecimalPipe, GraficoZonas, TitleCasePipe],
  templateUrl: './graficos-reportes.html',
})
export class GraficosReportes implements AfterViewInit, OnDestroy {
  readonly filtros = input.required<FiltrosMetricas>();
  readonly periodos = input.required<readonly IndicadorPeriodo[]>();
  private readonly api = inject(MetricasService);
  private readonly ref = inject(DestroyRef);
  readonly patron = new RequestState(this.ref);
  private readonly horasMedidas = signal<PatronZona[]>([]);
  readonly patronCargado = computed(() => this.horasMedidas().length > 0);
  private readonly mapa = computed(() => new Map(this.horasMedidas().map((f) => [f.dia_semana * 24 + f.hora, f])));
  readonly filtrosComparacion = computed(() => {
    const { desde, hasta, periodo, tipo_fuente } = this.filtros();
    return { desde, hasta, periodo, tipo_fuente };
  });
  readonly dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  readonly horas = Array.from({ length: 24 }, (_, i) => i);
  readonly estilosNivel = estilosNivel;
  readonly verContexto = signal(false);
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('nivelesCanvas');
  private grafico?: Chart<'doughnut', number[]>;

  readonly distribucion = computed(() => {
    const conteos = new Map<string, number>();
    for (const fila of this.periodos()) {
      const clave = fila.nivelOcupacion ?? fila.estadoOcupacion ?? 'sin_datos';
      conteos.set(clave, (conteos.get(clave) ?? 0) + 1);
    }
    return [...conteos].map(([clave, cantidad]) => ({ clave, cantidad,
      nombre: coloresNivel[clave] ? clave : estadoMedicion(clave) }));
  });

  constructor() {
    effect(() => {
      const filtros = this.filtros();
      untracked(() => {
        this.patron.reiniciar();
        this.horasMedidas.set([]);
        this.verContexto.set(false);
        this.cargarPatron(filtros);
      });
    });
    effect(() => this.dibujar(this.distribucion()));
  }

  cargarPatron(filtros = this.filtros()) {
    if (this.patron.loading()) return;
    this.patron.run(this.api.patronesZona(filtros), (filas) => this.horasMedidas.set(filas));
  }

  celda(dia: number, hora: number) { return this.mapa().get(dia * 24 + hora); }

  ngAfterViewInit() {
    this.grafico = new Chart<'doughnut', number[]>(this.canvas().nativeElement, {
      type: 'doughnut', data: { labels: [], datasets: [{ data: [] }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } },
    });
    this.dibujar(this.distribucion());
  }

  private dibujar(filas: ReturnType<typeof this.distribucion>) {
    if (!this.grafico) return;
    const estilos = getComputedStyle(this.canvas().nativeElement);
    this.grafico.data = { labels: filas.map((f) => f.nombre), datasets: [{
      data: filas.map((f) => f.cantidad),
      backgroundColor: filas.map((f) => estilos.getPropertyValue('--color-' + (coloresNivel[f.clave] ?? 'muted')).trim() || estilos.color),
    }] };
    this.grafico.update('none');
  }

  ngOnDestroy() { this.grafico?.destroy(); }
}
