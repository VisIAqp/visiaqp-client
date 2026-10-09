import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';

import { ZonaService } from '../../core/services/zona';
import { CamaraService } from '../../core/services/camara';
import { AnalisisService } from '../../core/services/analisis';

import { RegistroAnalisis } from '../../core/models/analisis.model';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements AfterViewInit, OnDestroy {

  private zonaService = inject(ZonaService);
  private camaraService = inject(CamaraService);
  private analisisService = inject(AnalisisService);

  @ViewChild('graficoDashboard')
  graficoDashboard!: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;

  zonas = this.zonaService.obtenerZonas();
  camaras = this.camaraService.obtenerCamaras();
  registros = this.analisisService.obtenerRegistros();

  get totalZonas(): number {
    return this.zonas.length;
  }

  get zonasActivas(): number {
    return this.zonas.filter(zona => zona.activa).length;
  }

  get totalCamaras(): number {
    return this.camaras.length;
  }

  get camarasActivas(): number {
    return this.camaras.filter(camara => camara.activa).length;
  }

  get camarasAnalizando(): number {
    return this.camaras.filter(
      camara => camara.activa && camara.analisisActivo
    ).length;
  }

  get totalPeatones(): number {
    return this.registros.reduce(
      (total, registro) =>
        total + registro.peatonesDetectados,
      0
    );
  }

  get maximoRegistrado(): number {

    if (!this.registros.length) {
      return 0;
    }

    return Math.max(
      ...this.registros.map(
        registro => registro.peatonesDetectados
      )
    );
  }

  get nivelActual(): string {

    if (!this.registros.length) {
      return 'Sin datos';
    }

    const ultimo = [...this.registros].sort(
      (a, b) =>
        b.fecha.getTime() - a.fecha.getTime()
    )[0];

    return ultimo.nivel;
  }

  get actividadReciente(): RegistroAnalisis[] {

    return [...this.registros]
      .sort(
        (a, b) =>
          b.fecha.getTime() - a.fecha.getTime()
      )
      .slice(0, 5);
  }

  obtenerNombreCamara(camaraId: number): string {

    return (
      this.camaraService
        .obtenerCamaraPorId(camaraId)?.nombre ??
      'Cámara desconocida'
    );
  }

  obtenerNombreZona(camaraId: number): string {

    const camara =
      this.camaraService.obtenerCamaraPorId(camaraId);

    if (!camara) {
      return 'Zona desconocida';
    }

    return (
      this.zonaService
        .obtenerZonaPorId(camara.zonaId)?.nombre ??
      'Zona desconocida'
    );
  }

  ngAfterViewInit(): void {
    this.crearGrafico();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private crearGrafico(): void {

    const datosPorHora = new Map<string, number>();

    for (const registro of this.registros) {

      const hora = registro.fecha.toLocaleTimeString(
        'es-PE',
        {
          hour: '2-digit',
          minute: '2-digit'
        }
      );

      const cantidadActual =
        datosPorHora.get(hora) ?? 0;

      datosPorHora.set(
        hora,
        cantidadActual + registro.peatonesDetectados
      );
    }

    this.chart = new Chart(
      this.graficoDashboard.nativeElement,
      {
        type: 'line',

        data: {
          labels: Array.from(datosPorHora.keys()),

          datasets: [
            {
              label: 'Peatones detectados',
              data: Array.from(datosPorHora.values()),
              tension: 0.3,
              fill: false
            }
          ]
        },

        options: {
          responsive: true,
          maintainAspectRatio: false,

          plugins: {
            legend: {
              display: true
            }
          },

          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      }
    );
  }
}