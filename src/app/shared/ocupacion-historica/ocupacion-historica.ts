import { AfterViewInit, Component, effect, ElementRef, input, OnDestroy, viewChild } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { IndicadorPeriodo } from '../../core/models/indicador.model';

interface PuntoOcupacion {
  x: number;
  y: number | null;
}

@Component({
  selector: 'app-ocupacion-historica',
  template: `
    <section class="ui-card p-4 desktop:p-5 print:mb-3 print:break-inside-avoid" aria-labelledby="titulo-ocupacion-historica">
      <h3 id="titulo-ocupacion-historica" class="mt-0">Ocupación histórica</h3>
      <div class="relative h-72 min-w-0 desktop:h-82.5 print:h-48" [class.hidden]="!hayOcupacion()">
        <canvas #canvas role="img" aria-label="Promedio de personas presentes por periodo. Los valores se muestran en la tabla de indicadores."></canvas>
      </div>
      @if (hayOcupacion()) {
        <p class="mt-2 mb-0 text-caption text-muted">Los huecos indican periodos sin medición.</p>
      } @else {
        <p class="mb-0 text-label text-muted">Sin medición de ocupación para esta consulta.</p>
      }
    </section>
  `,
})
export class OcupacionHistorica implements AfterViewInit, OnDestroy {
  readonly filas = input.required<readonly IndicadorPeriodo[]>();
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private grafico?: Chart<'line', PuntoOcupacion[]>;
  private readonly formato = new Intl.DateTimeFormat('es-PE', {
    timeZone: 'America/Lima', day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
  private readonly formatoEje = new Intl.DateTimeFormat('es-PE', {
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
    this.grafico = new Chart<'line', PuntoOcupacion[]>(this.canvas().nativeElement, {
      type: 'line',
      data: { datasets: [{
        label: 'Personas presentes en promedio por cámara', data: [],
        borderColor: colores.getPropertyValue('--color-brand').trim() || colores.color,
        spanGaps: false,
      }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        parsing: false,
        scales: {
          y: { beginAtZero: true },
          x: { type: 'linear', ticks: { maxTicksLimit: 7, callback: (valor) => this.formatoEje.format(Number(valor)) } },
        },
        plugins: { tooltip: { callbacks: {
          title: ([item]) => {
            const instante = item?.parsed.x;
            return instante == null ? '' : this.formato.format(instante);
          },
        } } },
      },
    });
    this.actualizar(this.filas());
  }

  ngOnDestroy() {
    this.grafico?.destroy();
  }

  private actualizar(filas: readonly IndicadorPeriodo[]) {
    if (!this.grafico) return;
    const puntos: PuntoOcupacion[] = [];
    let finAnterior: number | undefined;
    // La API ordena por inicio. Un punto nulo separa periodos no consecutivos.
    for (const fila of filas) {
      const inicio = fila.periodoInicio.getTime();
      if (finAnterior !== undefined && inicio > finAnterior) {
        puntos.push({ x: finAnterior, y: null });
      }
      puntos.push({ x: inicio, y: fila.promedioPresentes ?? null });
      finAnterior = fila.periodoFin.getTime();
    }
    const serie = this.grafico.data.datasets[0];
    serie.data = puntos;
    serie.pointRadius = puntos.length > 100 ? 1 : 3;
    this.grafico.update('none');
  }
}
