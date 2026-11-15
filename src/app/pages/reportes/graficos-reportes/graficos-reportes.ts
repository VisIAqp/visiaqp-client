import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { AfterViewInit, Component, computed, DestroyRef, effect, ElementRef, inject, input, OnDestroy, signal, untracked, viewChild } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { estadoMedicion } from '../../../core/api/metricas-presentacion';
import { PanelMetricas } from '../../../core/api/panel-metricas';
import { RequestState } from '../../../core/api/request-state';
import { DistribucionNivel, FiltrosMetricas, PatronZona } from '../../../core/models/metricas.model';
import { MetricasService } from '../../../core/services/metricas';
import { ApiState } from '../../../shared/api-state/api-state';
import { GraficoZonas } from '../../../shared/grafico-zonas/grafico-zonas';
import { Pagination } from '../../../shared/pagination/pagination';
import { Contexto } from '../../contexto/contexto';

const estilosNivel = {
  bajo: 'bg-success-soft text-success', medio: 'bg-warning-soft text-warning', alto: 'bg-danger-soft text-danger',
};
const coloresNivel: Record<string, string> = { bajo: 'success', medio: 'warning', alto: 'danger' };

@Component({
  selector: 'app-graficos-reportes',
  imports: [ApiState, Contexto, DecimalPipe, GraficoZonas, Pagination, TitleCasePipe],
  templateUrl: './graficos-reportes.html',
})
export class GraficosReportes implements AfterViewInit, OnDestroy {
  readonly filtros = input.required<FiltrosMetricas>();
  private readonly api = inject(MetricasService);
  private readonly ref = inject(DestroyRef);
  readonly patron = new RequestState(this.ref);
  private readonly horasMedidas = signal<PatronZona[]>([]);
  readonly patronCargado = computed(() => this.horasMedidas().length > 0);
  private readonly mapa = computed(() => new Map(this.horasMedidas().map((f) => [f.dia_semana * 24 + f.hora, f])));
  readonly niveles = new PanelMetricas<DistribucionNivel>(this.ref);
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
    for (const fila of this.niveles.filas) {
      const clave = fila.nivel_ocupacion ?? fila.estado_ocupacion;
      conteos.set(clave, (conteos.get(clave) ?? 0) + fila.cantidad_periodos);
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
        this.niveles.limpiar();
        this.verContexto.set(false);
        this.cargarPatron(filtros);
        this.cargarNiveles(0, filtros);
      });
    });
  }

  cargarPatron(filtros = this.filtros()) {
    if (this.patron.loading()) return;
    this.patron.run(this.api.patronesZona(filtros), (filas) => this.horasMedidas.set(filas));
  }

  cargarNiveles(desplazamiento = 0, filtros = this.filtros()) {
    this.niveles.cargar(this.api.distribucion(filtros, desplazamiento), () => this.dibujar());
  }

  celda(dia: number, hora: number) { return this.mapa().get(dia * 24 + hora); }

  ngAfterViewInit() {
    this.grafico = new Chart<'doughnut', number[]>(this.canvas().nativeElement, {
      type: 'doughnut', data: { labels: [], datasets: [{ data: [] }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } },
    });
    this.dibujar();
  }

  private dibujar() {
    if (!this.grafico) return;
    const filas = this.distribucion();
    const estilos = getComputedStyle(this.canvas().nativeElement);
    this.grafico.data = { labels: filas.map((f) => f.nombre), datasets: [{
      data: filas.map((f) => f.cantidad),
      backgroundColor: filas.map((f) => estilos.getPropertyValue('--color-' + (coloresNivel[f.clave] ?? 'muted')).trim() || estilos.color),
    }] };
    this.grafico.update('none');
  }

  ngOnDestroy() { this.grafico?.destroy(); }
}
