import { AfterViewInit, Component, effect, ElementRef, input, OnDestroy, viewChild } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { fechaMetrica } from '../../../core/api/metricas-presentacion';
import { EstimacionOcupacion, PronosticoOcupacion } from '../../../core/models/pronostico.model';

const MINUTO_MS = 60_000;
const BLOQUE_MIN = 5;
const HISTORIAL_MIN = 30;

interface Punto {
  x: number;
  y: number | null;
  estimacion?: EstimacionOcupacion;
}

@Component({
  selector: 'app-grafico-pronostico',
  template: `
    <figure class="m-0 min-w-0">
      <div class="relative h-64 desktop:h-72">
        <canvas #canvas role="img"
          aria-label="Ocupación observada y pronósticos a 15 y 30 minutos para esta cámara"></canvas>
      </div>
      <figcaption class="mt-2 text-caption text-muted">
        Hora de Lima. La marca vertical indica el fin del bloque base del pronóstico.
        Cada punto representa un promedio de 5 minutos.
        @if (!datos().observaciones?.length) {
          Historial observado no disponible.
        }
      </figcaption>
    </figure>
  `,
})
export class GraficoPronostico implements AfterViewInit, OnDestroy {
  readonly datos = input.required<PronosticoOcupacion>();
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly hora = new Intl.DateTimeFormat('es-PE', {
    timeZone: 'America/Lima', hourCycle: 'h23', hour: '2-digit', minute: '2-digit',
  });
  private readonly fechaHora = new Intl.DateTimeFormat('es-PE', {
    timeZone: 'America/Lima', hourCycle: 'h23', day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
  private grafico?: Chart<'line', Punto[]>;
  private base = 0;

  constructor() {
    effect(() => this.dibujar(this.datos()));
  }

  ngAfterViewInit() {
    const canvas = this.canvas().nativeElement;
    const estilos = getComputedStyle(canvas);
    const observado = estilos.getPropertyValue('--color-brand').trim() || estilos.color;
    const estimado = estilos.getPropertyValue('--color-warning').trim() || estilos.color;
    const divisor = estilos.getPropertyValue('--color-divider').trim();
    this.grafico = new Chart<'line', Punto[]>(canvas, {
      type: 'line',
      data: { datasets: [
        { label: 'Ocupación observada', data: [], borderColor: observado, backgroundColor: observado,
          borderWidth: 2, pointRadius: 3 },
        { label: 'Pronóstico', data: [], borderColor: estimado, backgroundColor: estimado,
          showLine: false, pointStyle: 'rectRot', pointRadius: 6, pointHitRadius: 8, clip: 8 },
      ] },
      options: {
        responsive: true, maintainAspectRatio: false, parsing: false, animation: false, spanGaps: false,
        scales: {
          x: {
            type: 'linear', min: -HISTORIAL_MIN, max: 30,
            ticks: { stepSize: 15, callback: (valor) => this.hora.format(this.base + Number(valor) * MINUTO_MS) },
            grid: {
              color: ({ tick }) => tick?.value === 0 ? estilos.color : divisor,
              lineWidth: ({ tick }) => tick?.value === 0 ? 2 : 1,
            },
          },
          y: { beginAtZero: true, title: { display: true, text: 'Personas en promedio' } },
        },
        plugins: {
          legend: { position: 'bottom', labels: { usePointStyle: true } },
          tooltip: { callbacks: {
            title: ([item]) => {
              if (item?.parsed.x == null) return '';
              const fin = this.base + item.parsed.x * MINUTO_MS;
              return this.fechaHora.formatRange(fin - BLOQUE_MIN * MINUTO_MS, fin);
            },
            afterLabel: (item) => {
              const estimacion = (item.raw as Punto).estimacion;
              if (!estimacion) return '';
              const metodo = estimacion.metodo === 'regresion_ridge'
                ? 'Regresión Ridge' : 'Última ocupación observada';
              return `+${estimacion.horizonte_min} min · ${metodo}`;
            },
          } },
        },
      },
    });
    this.dibujar(this.datos());
  }

  private dibujar(datos: PronosticoOcupacion) {
    const grafico = this.grafico;
    if (!grafico || !datos.base_en) return;
    this.base = fechaMetrica(datos.base_en).getTime();
    const observaciones = new Map((datos.observaciones ?? []).map((punto) =>
      [fechaMetrica(punto.fin_en).getTime(), punto.promedio_presentes]));
    const observados: Punto[] = [];
    for (let x = BLOQUE_MIN - HISTORIAL_MIN; x <= 0; x += BLOQUE_MIN) {
      observados.push({ x, y: observaciones.get(this.base + x * MINUTO_MS) ?? null });
    }
    grafico.data.datasets[0].data = observados;
    grafico.data.datasets[1].data = datos.estimaciones.map((estimacion) => ({
      x: (fechaMetrica(estimacion.objetivo_en).getTime() - this.base) / MINUTO_MS,
      y: estimacion.promedio_presentes,
      estimacion,
    })).sort((a, b) => a.x - b.x);
    grafico.update('none');
  }

  ngOnDestroy() { this.grafico?.destroy(); }
}
