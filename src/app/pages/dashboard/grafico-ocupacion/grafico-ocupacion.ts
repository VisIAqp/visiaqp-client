import { AfterViewInit, Component, effect, ElementRef, input, OnDestroy, output, viewChild } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { fechaMetrica, prepararSeries } from '../../../core/api/metricas-presentacion';
import { Camara } from '../../../core/models/camara.model';
import { DatosOcupacionReciente, PuntoSerie, PuntoZona, VentanaOcupacion } from '../../../core/models/metricas.model';
import { alternarCamara, camarasOcultas, colorOcupacion, detalleEjecucion, estiloCamara, etiquetasCamaras } from '../../../shared/graficos/ocupacion-estilo';
import { AgrupacionOcupacion, VistaOcupacion } from '../filtros-ocupacion/filtros-ocupacion';

type Punto = { x: number; y: number | null };

function agrupar<T>(filas: readonly T[], clave: (fila: T) => number): Map<number, T[]> {
  const grupos = new Map<number, T[]>();
  for (const fila of filas) {
    const id = clave(fila);
    const grupo = grupos.get(id);
    if (grupo) grupo.push(fila);
    else grupos.set(id, [fila]);
  }
  return grupos;
}

@Component({
  selector: 'app-grafico-ocupacion',
  templateUrl: './grafico-ocupacion.html',
})
export class GraficoOcupacion implements AfterViewInit, OnDestroy {
  readonly agrupacion = input.required<AgrupacionOcupacion>();
  readonly vista = input.required<VistaOcupacion>();
  readonly periodo = input.required<'hora' | 'dia'>();
  readonly camaras = input.required<readonly Camara[]>();
  readonly historico = input.required<PuntoSerie[]>();
  readonly reciente = input.required<DatosOcupacionReciente | null>();
  readonly ventanas = input.required<readonly VentanaOcupacion[]>();
  readonly zonas = input.required<readonly PuntoZona[]>();
  readonly cargando = input(false);
  readonly error = input('');
  readonly hayMediciones = input(false);
  readonly mensajeVacio = input('Sin datos para esta selección.');
  readonly reintentar = output<void>();
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly ocultas = new Set<string>();
  private grafico?: Chart<'line', Punto[]>;

  private readonly hora = this.formato({ hour: '2-digit', minute: '2-digit' });
  private readonly dia = this.formato({ day: '2-digit', month: '2-digit' });
  private readonly fechaHora = this.formato({ day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  private readonly fechaVentana = this.formato({ day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });

  constructor() {
    effect(() => this.dibujar(this.agrupacion(), this.vista(), this.periodo(), this.camaras(),
      this.historico(), this.reciente(), this.ventanas(), this.zonas()));
  }

  ngAfterViewInit() {
    this.grafico = new Chart<'line', Punto[]>(this.canvas().nativeElement, {
      type: 'line', data: { datasets: [] },
      options: {
        responsive: true, maintainAspectRatio: false, parsing: false, animation: false, spanGaps: false,
        scales: {
          x: { type: 'linear', ticks: { maxTicksLimit: 8, callback: (valor) => this.formatoEje().format(Number(valor)) } },
          y: { beginAtZero: true, title: { display: true, text: 'Personas presentes en promedio' } },
        },
        plugins: {
          legend: {
            position: 'bottom', labels: { boxWidth: 12, generateLabels: etiquetasCamaras },
            onClick: (evento, item, leyenda) => {
              alternarCamara.call(leyenda, evento, item, leyenda);
              const ocultasVisibles = camarasOcultas(leyenda.chart);
              for (const serie of leyenda.chart.data.datasets) {
                const clave = (serie as { claveCamara?: string }).claveCamara;
                if (!clave) continue;
                if (ocultasVisibles.has(clave)) this.ocultas.add(clave);
                else this.ocultas.delete(clave);
              }
            },
          },
          tooltip: { callbacks: {
            afterLabel: detalleEjecucion,
            title: ([punto]) => punto?.parsed.x == null ? '' :
              (this.vista() === 'reciente' && this.agrupacion() === 'camara' ? this.fechaVentana : this.formatoEje(true))
                .format(punto.parsed.x),
          } },
        },
      },
    });
    this.dibujar(this.agrupacion(), this.vista(), this.periodo(), this.camaras(),
      this.historico(), this.reciente(), this.ventanas(), this.zonas());
  }

  private dibujar(agrupacion: AgrupacionOcupacion, vista: VistaOcupacion, periodo: 'hora' | 'dia',
    camaras: readonly Camara[], historico: PuntoSerie[], reciente: DatosOcupacionReciente | null,
    ventanas: readonly VentanaOcupacion[], zonas: readonly PuntoZona[]) {
    const grafico = this.grafico;
    if (!grafico) return;
    const estilos = getComputedStyle(this.canvas().nativeElement);
    const paso = vista === 'reciente' ? 60000 : periodo === 'hora' ? 3600000 : 86400000;
    const zona = agrupacion === 'zona';
    let series: { label: string; claveCamara: string; detalle: string; borderColor: string;
      backgroundColor: string; data: Punto[]; hidden: boolean }[];
    if (zona) {
      series = [...agrupar(zonas, (fila) => fila.id_zona).values()].map((grupo) => {
        const [fila] = grupo;
        const color = colorOcupacion(estilos, fila.id_zona);
        const claveCamara = `ocupacion-zona:${fila.id_zona}`;
        return { label: fila.nombre_zona, claveCamara, detalle: '', borderColor: color, backgroundColor: color,
          data: this.conHuecos(grupo, paso), hidden: this.ocultas.has(claveCamara) };
      });
    } else if (vista === 'reciente') {
      series = [...agrupar(ventanas, (fila) => fila.id_procesamiento).values()].map((grupo) => {
        const estilo = estiloCamara(grupo[0], camaras, estilos);
        return { ...estilo, data: this.conHuecos(grupo, 5000), hidden: this.ocultas.has(estilo.claveCamara) };
      });
    } else {
      const preparada = prepararSeries(historico, periodo);
      const porEjecucion = new Map(historico.map((fila) => [fila.id_procesamiento, fila]));
      series = preparada.series.map((serie) => {
        const estilo = estiloCamara(porEjecucion.get(serie.id)!, camaras, estilos);
        return { ...estilo, data: preparada.tiempos.map((x, i) => ({ x, y: serie.datos[i] })),
          hidden: this.ocultas.has(estilo.claveCamara) };
      });
    }
    grafico.data.datasets = series.map((serie) => ({ ...serie, borderWidth: 2,
      pointRadius: serie.data.filter((punto) => punto.y !== null).length > 100 ? 1 : 3 }));
    let primero = Infinity;
    let ultimo = -Infinity;
    for (const { data } of series) {
      if (!data.length) continue;
      primero = Math.min(primero, data[0].x);
      ultimo = Math.max(ultimo, data[data.length - 1].x);
    }
    const eje = grafico.options.scales!['x']!;
    eje.min = Number.isFinite(primero) ? primero : undefined;
    eje.max = Number.isFinite(ultimo) ? Math.max(primero + paso, ultimo) : undefined;
    if (reciente && vista === 'reciente' && !zona) {
      const fin = fechaMetrica(reciente.hasta).getTime();
      eje.min = Math.max(fechaMetrica(reciente.desde).getTime(), Math.min(eje.min ?? fin, fin - 5 * paso));
      eje.max = fin;
    }
    grafico.options.scales!['y']!.title!.text = zona ? 'Personas en promedio por cámara' : 'Personas presentes en promedio';
    grafico.update('none');
  }

  private conHuecos(filas: readonly (PuntoZona | VentanaOcupacion)[], paso: number): Punto[] {
    const datos: Punto[] = [];
    let finAnterior: number | undefined;
    for (const fila of [...filas].sort((a, b) => a.periodo_inicio.localeCompare(b.periodo_inicio))) {
      const x = fechaMetrica(fila.periodo_inicio).getTime();
      if (finAnterior !== undefined && x - finAnterior > paso) datos.push({ x: (finAnterior + x) / 2, y: null });
      datos.push({ x, y: fila.promedio_presentes });
      finAnterior = 'periodo_fin' in fila ? fechaMetrica(fila.periodo_fin).getTime() : x;
    }
    return datos;
  }

  private formatoEje(detalle = false) {
    if (this.vista() === 'reciente') return detalle ? this.fechaHora : this.hora;
    return this.periodo() === 'dia' ? this.dia : this.fechaHora;
  }

  private formato(opciones: Intl.DateTimeFormatOptions) {
    return new Intl.DateTimeFormat('es-PE', { timeZone: 'America/Lima', hourCycle: 'h23', ...opciones });
  }

  ngOnDestroy() { this.grafico?.destroy(); }
}
