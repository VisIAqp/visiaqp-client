import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Chart } from 'chart.js/auto';

import { AnalisisService } from '../../core/services/analisis';
import { CamaraService } from '../../core/services/camara';
import { ZonaService } from '../../core/services/zona';

import { RegistroAnalisis } from '../../core/models/analisis.model';

@Component({
  selector: 'app-analisis',
  imports: [CommonModule, FormsModule],
  templateUrl: './analisis.html',
  styleUrl: './analisis.css'
})
export class Analisis implements AfterViewInit, OnDestroy {

  private analisisService = inject(AnalisisService);
  private camaraService = inject(CamaraService);
  private zonaService = inject(ZonaService);

  @ViewChild('graficoPeatones')
  graficoPeatones!: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;

  zonaSeleccionada = 0;
  camaraSeleccionada = 0;

  zonas = this.zonaService.obtenerZonas();
  camaras = this.camaraService.obtenerCamaras();
  registros = this.analisisService.obtenerRegistros();

  ngAfterViewInit(): void {
    this.crearGrafico();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  get camarasDisponibles() {

    if (!this.zonaSeleccionada) {
      return this.camaras;
    }

    return this.camaras.filter(
      camara => camara.zonaId === Number(this.zonaSeleccionada)
    );
  }

  get registrosFiltrados(): RegistroAnalisis[] {

    return this.registros.filter(registro => {

      const camara = this.camaraService.obtenerCamaraPorId(
        registro.camaraId
      );

      if (!camara) {
        return false;
      }

      const coincideZona =
        !this.zonaSeleccionada ||
        camara.zonaId === Number(this.zonaSeleccionada);

      const coincideCamara =
        !this.camaraSeleccionada ||
        registro.camaraId === Number(this.camaraSeleccionada);

      return coincideZona && coincideCamara;
    });
  }

  get totalPeatones(): number {

    return this.registrosFiltrados.reduce(
      (total, registro) =>
        total + registro.peatonesDetectados,
      0
    );
  }

  get promedioPeatones(): number {

    if (!this.registrosFiltrados.length) {
      return 0;
    }

    return Math.round(
      this.totalPeatones / this.registrosFiltrados.length
    );
  }

  get maximoPeatones(): number {

    if (!this.registrosFiltrados.length) {
      return 0;
    }

    return Math.max(
      ...this.registrosFiltrados.map(
        registro => registro.peatonesDetectados
      )
    );
  }

  obtenerNombreCamara(camaraId: number): string {

    return (
      this.camaraService.obtenerCamaraPorId(camaraId)?.nombre ??
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
      this.zonaService.obtenerZonaPorId(camara.zonaId)?.nombre ??
      'Zona desconocida'
    );
  }

  aplicarFiltros(): void {

    if (
      this.camaraSeleccionada &&
      !this.camarasDisponibles.some(
        camara => camara.id === Number(this.camaraSeleccionada)
      )
    ) {
      this.camaraSeleccionada = 0;
    }

    this.actualizarGrafico();
  }

  private crearGrafico(): void {

    this.chart = new Chart(
      this.graficoPeatones.nativeElement,
      {
        type: 'line',

        data: {
          labels: [],
          datasets: [
            {
              label: 'Peatones detectados',
              data: [],
              tension: 0.3
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

    this.actualizarGrafico();
  }

  private actualizarGrafico(): void {

    if (!this.chart) {
      return;
    }

    const registros = this.registrosFiltrados;

    this.chart.data.labels = registros.map(
      registro =>
        registro.fecha.toLocaleTimeString(
          'es-PE',
          {
            hour: '2-digit',
            minute: '2-digit'
          }
        )
    );

    this.chart.data.datasets[0].data =
      registros.map(
        registro => registro.peatonesDetectados
      );

    this.chart.update();
  }
}