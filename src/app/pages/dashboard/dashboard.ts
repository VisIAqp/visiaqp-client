import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart } from 'chart.js/auto';
import { ZonaService } from '../../core/services/zona';
import { CamaraService } from '../../core/services/camara';
import { AnalisisService } from '../../core/services/analisis';
import { IndicadorService } from '../../core/services/indicador';
import { PeriodoTipo } from '../../core/models/indicador.model';
@Component({ selector: 'app-dashboard', imports: [CommonModule, FormsModule], templateUrl: './dashboard.html', styleUrl: './dashboard.css' })
export class Dashboard implements AfterViewInit, OnDestroy {
  private zonaService = inject(ZonaService);
  private camaraService = inject(CamaraService);
  private analisisService = inject(AnalisisService);
  private indicadorService = inject(IndicadorService);
  @ViewChild('graficoDashboard') graficoDashboard!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;
  zonas = this.zonaService.obtenerZonas();
  camaras = this.camaraService.obtenerCamaras();
  registros = this.analisisService.obtenerRegistros();
  zonaSeleccionada = 1;
  periodoTipo: PeriodoTipo = 'hora';
  get indicadores() { return this.indicadorService.obtenerIndicadores().filter(i => i.zonaId === Number(this.zonaSeleccionada) && i.periodoTipo === this.periodoTipo).sort((a,b) => a.periodoInicio.getTime() - b.periodoInicio.getTime()); }
  get ultimoIndicador() { return this.indicadores.at(-1); }
  get totalZonas() { return this.zonas.length; }
  get zonasActivas() { return this.zonas.filter(z => z.estado === 'activa').length; }
  get totalCamaras() { return this.camaras.length; }
  get camarasActivas() { return this.camaras.filter(c => c.estado === 'activa').length; }
  get camarasAnalizando() { return this.camaras.filter(c => c.estado === 'activa' && this.analisisService.estaAnalizando(c.id)).length; }
  get maximoRegistrado() { return this.ultimoIndicador?.maxPeatones ?? 'Sin datos'; }
  get nivelActual() { return this.ultimoIndicador?.nivelConcentracion ?? 'Sin datos'; }
  get actividadReciente() { return this.registros.filter(r => r.zonaId === Number(this.zonaSeleccionada)).sort((a,b) => b.periodoInicio.getTime() - a.periodoInicio.getTime()).slice(0,5); }
  obtenerNombreCamara(id: number | null) { return id === null ? 'Archivo sin cámara' : this.camaraService.obtenerCamaraPorId(id)?.nombre ?? 'Cámara desconocida'; }
  obtenerNombreZona(id: number) { return this.zonaService.obtenerZonaPorId(id)?.nombre ?? 'Zona desconocida'; }
  ngAfterViewInit() {
    this.chart = new Chart(this.graficoDashboard.nativeElement, { type: 'line', data: { labels: [], datasets: [{ label: 'Promedio de conteos por ventana', data: [], tension: 0.3 }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } } });
    this.actualizarGrafico();
  }
  actualizarGrafico() {
    if (!this.chart) return;
    this.chart.data.labels = this.indicadores.map(i => i.periodoInicio.toLocaleString('es-PE', { timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }));
    this.chart.data.datasets[0].data = this.indicadores.map(i => i.promedioPeatones);
    this.chart.update();
  }
  ngOnDestroy() { this.chart?.destroy(); }
}
