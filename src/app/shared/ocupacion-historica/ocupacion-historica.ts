import { AfterViewInit, Component, effect, ElementRef, input, OnDestroy, viewChild } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { Indicador } from '../../core/models/indicador.model';

@Component({
  selector: 'app-ocupacion-historica',
  template: `
    <section class="ui-card p-4 desktop:p-5" aria-labelledby="titulo-ocupacion-historica">
      <h3 id="titulo-ocupacion-historica" class="mt-0">Ocupación histórica</h3>
      <div class="relative h-72 min-w-0 desktop:h-82.5" [class.hidden]="!hayOcupacion()">
        <canvas #canvas role="img" aria-label="Promedio de personas presentes por periodo. Los valores se muestran en la tabla de indicadores."></canvas>
      </div>
      @if (!hayOcupacion()) {
        <p class="mb-0 text-label text-muted">Sin medición de ocupación para esta consulta.</p>
      }
    </section>
  `,
})
export class OcupacionHistorica implements AfterViewInit, OnDestroy {
  readonly filas = input.required<readonly Indicador[]>();
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private grafico?: Chart<'line', (number | null)[], string>;
  private readonly formato = new Intl.DateTimeFormat('es-PE', {
    timeZone: 'America/Lima', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  });

  constructor() {
    effect(() => this.actualizar(this.filas()));
  }

  hayOcupacion() {
    return this.filas().some((fila) => fila.promedioPresentes != null);
  }

  ngAfterViewInit() {
    const colores = getComputedStyle(this.canvas().nativeElement);
    this.grafico = new Chart<'line', (number | null)[], string>(this.canvas().nativeElement, {
      type: 'line',
      data: { labels: [], datasets: [{
        label: 'Personas presentes (promedio)', data: [],
        borderColor: colores.getPropertyValue('--color-brand').trim() || colores.color,
        tension: 0.3, spanGaps: false,
      }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true }, x: { ticks: { maxTicksLimit: 8 } } },
      },
    });
    this.actualizar(this.filas());
  }

  ngOnDestroy() {
    this.grafico?.destroy();
  }

  private actualizar(filas: readonly Indicador[]) {
    if (!this.grafico) return;
    this.grafico.data.labels = filas.map((fila) => this.formato.format(fila.periodoInicio));
    this.grafico.data.datasets[0].data = filas.map((fila) => fila.promedioPresentes ?? null);
    this.grafico.update('none');
  }
}
