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
  procesamientos = this.analisisService.obtenerProcesamientos();
  get procesamientosFiltrados() { return this.procesamientos.filter(p => (!this.zonaSeleccionada || p.zonaId === Number(this.zonaSeleccionada)) && (!this.camaraSeleccionada || p.camaraId === Number(this.camaraSeleccionada))); }

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

      const coincideZona =
        !this.zonaSeleccionada ||
        registro.zonaId === Number(this.zonaSeleccionada);

      const coincideCamara =
        !this.camaraSeleccionada ||
        registro.camaraId === Number(this.camaraSeleccionada);

      return coincideZona && coincideCamara;
    });
  }

  get totalPeatones(): number {

    return this.registrosFiltrados.reduce(
      (total, registro) =>
        total + registro.cantidadPeatones,
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
        registro => registro.cantidadPeatones
      )
    );
  }

  obtenerNombreCamara(camaraId: number | null): string {

    return (
      this.camaraService.obtenerCamaraPorId(camaraId ?? 0)?.nombre ??
      'Archivo sin cámara'
    );
  }

  obtenerNombreZona(zonaId: number): string {
    return this.zonaService.obtenerZonaPorId(zonaId)?.nombre ?? 'Zona desconocida';
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

    const registros = [...this.registrosFiltrados].sort((a,b) => a.periodoInicio.getTime() - b.periodoInicio.getTime());
    const instantes = [...new Set(registros.map(r => r.periodoInicio.getTime()))].sort((a,b) => a-b);
    this.chart.data.labels = instantes.map(t => new Date(t).toLocaleString('es-PE', { timeZone: 'America/Lima', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }));
    this.chart.data.datasets = [...new Set(registros.map(r => r.procesamientoId))].map(id => {
      const ventanas = registros.filter(r => r.procesamientoId === id);
      return { label: this.obtenerNombreZona(ventanas[0].zonaId) + ' · ' + this.obtenerNombreCamara(ventanas[0].camaraId) + ' · ejecución ' + id, data: instantes.map(t => ventanas.find(r => r.periodoInicio.getTime() === t)?.cantidadPeatones ?? null), tension: 0.3, spanGaps: false };
    });
    this.chart.update();
  }
}
