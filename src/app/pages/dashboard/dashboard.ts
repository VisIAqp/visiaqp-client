import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Chart } from 'chart.js/auto';
import { RequestState } from '../../core/api/request-state';
import { ApiState } from '../../shared/api-state/api-state';
import { ZonaService } from '../../core/services/zona';
import { CamaraService } from '../../core/services/camara';
import { IndicadorService } from '../../core/services/indicador';
import { AnalisisService } from '../../core/services/analisis';
import { Zona } from '../../core/models/zona.model';
import { Camara } from '../../core/models/camara.model';
import { Indicador, PeriodoTipo } from '../../core/models/indicador.model';
import { Procesamiento } from '../../core/models/analisis.model';
import { addDays, limaToday } from '../../core/api/dates';
@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, ApiState],
  templateUrl: './dashboard.html',
})
export class Dashboard implements AfterViewInit, OnDestroy {
  private zonasApi = inject(ZonaService);
  private camarasApi = inject(CamaraService);
  private indicadoresApi = inject(IndicadorService);
  private procesamientosApi = inject(AnalisisService);
  readonly request = new RequestState(inject(DestroyRef));
  zonas: Zona[] = [];
  camaras: Camara[] = [];
  procesamientos: Procesamiento[] = [];
  indicadores: Indicador[] = [];
  zonaSeleccionada = 0;
  periodoTipo: PeriodoTipo = 'hora';
  @ViewChild('graficoDashboard') graficoDashboard!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;
  get ultimoIndicador() {
    return this.indicadores.at(-1);
  }
  get camarasActivas() {
    return this.camaras.filter((c) => c.estado === 'activa').length;
  }
  get zonasActivas() {
    return this.zonas.filter((z) => z.estado === 'activa').length;
  }
  get procesando() {
    return this.procesamientos.filter((p) => p.estado === 'procesando').length;
  }
  ngAfterViewInit() {
    this.chart = new Chart(this.graficoDashboard.nativeElement, {
      type: 'line',
      data: { labels: [], datasets: [{ label: 'Promedio por periodo', data: [], tension: 0.3 }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } },
      },
    });
    this.cargar();
  }
  cargar() {
    this.request.run(
      forkJoin({
        zonas: this.zonasApi.listar(),
        camaras: this.camarasApi.listar(),
        procesamientos: this.procesamientosApi.listar(),
      }),
      (d) => {
        this.zonas = d.zonas;
        this.camaras = d.camaras;
        this.procesamientos = d.procesamientos;
        if (!this.zonas.some((z) => z.id === this.zonaSeleccionada))
          this.zonaSeleccionada = this.zonas[0]?.id || 0;
        this.actualizarGrafico();
      },
    );
  }
  actualizarGrafico() {
    this.indicadores = [];
    this.renderChart();
    if (!this.zonaSeleccionada) return;
    const today = limaToday();
    this.request.run(
      this.indicadoresApi.historico(
        this.zonaSeleccionada,
        this.periodoTipo,
        addDays(today, -6) + 'T00:00:00',
        addDays(today, 1) + 'T00:00:00',
      ),
      (rows) => {
        this.indicadores = rows;
        this.renderChart();
      },
    );
  }
  private renderChart() {
    if (!this.chart) return;
    this.chart.data.labels = this.indicadores.map((i) =>
      i.periodoInicio.toLocaleString('es-PE', {
        timeZone: 'America/Lima',
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    );
    this.chart.data.datasets[0].data = this.indicadores.map((i) => i.promedioPeatones);
    this.chart.update();
  }
  nombreZona(id: number) {
    return this.zonas.find((z) => z.id === id)?.nombre || 'Zona ' + id;
  }
  nombreCamara(id: number | null) {
    return id === null
      ? 'Archivo sin cámara'
      : this.camaras.find((c) => c.id === id)?.nombre || 'Cámara ' + id;
  }
  ngOnDestroy() {
    this.chart?.destroy();
  }
}
