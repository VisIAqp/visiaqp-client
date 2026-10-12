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
import { forkJoin, filter, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Chart } from 'chart.js/auto';
import { Auth } from '../../core/auth/auth';
import { API_CONFIG } from '../../core/api/api-config';
import { DtoMapper, VideoDto } from '../../core/api/dto';
import { RequestState } from '../../core/api/request-state';
import { IndicatorQuery } from '../../core/api/indicator-query';
import { IndicatorView } from '../../shared/indicator-view/indicator-view';
import { ApiState } from '../../shared/api-state/api-state';
import { AnalisisService } from '../../core/services/analisis';
import { CamaraService } from '../../core/services/camara';
import { VideoService } from '../../core/services/video';
import { Camara } from '../../core/models/camara.model';
import { Procesamiento, EstadoProcesamiento } from '../../core/models/analisis.model';
@Component({
  selector: 'app-analisis',
  imports: [CommonModule, FormsModule, ApiState, IndicatorView],
  providers: [IndicatorQuery],
  templateUrl: './analisis.html',
})
export class Analisis implements AfterViewInit, OnDestroy {
  readonly auth = inject(Auth);
  readonly history = inject(IndicatorQuery);
  private api = inject(AnalisisService);
  private camarasApi = inject(CamaraService);
  private videosApi = inject(VideoService);
  private mapper = inject(DtoMapper);
  private config = inject(API_CONFIG);
  private ref = inject(DestroyRef);
  readonly request = new RequestState(this.ref);
  readonly saving = new RequestState(this.ref);
  videos: VideoDto[] = [];
  camaras: Camara[] = [];
  procesamientos: Procesamiento[] = [];
  videoId = 0;
  camaraId = 0;
  fechaCaptura = '';
  filtroEstado: EstadoProcesamiento | '' = '';
  filtroCamara = 0;
  mensaje = '';
  actualizado: Date | null = null;
  @ViewChild('graficoPeatones') grafico!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;
  ngAfterViewInit() {
    this.chart = new Chart(this.grafico.nativeElement, {
      type: 'line',
      data: { labels: [], datasets: [{ label: 'Promedio por periodo', data: [], tension: 0.3 }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } },
      },
    });
    this.history.changed = () => this.renderChart();
    this.history.inicializar();
    this.cargar();
    timer(this.config.pollMs, this.config.pollMs)
      .pipe(
        filter(
          () =>
            !document.hidden &&
            this.auth.validToken() &&
            !this.request.loading() &&
            !this.saving.loading(),
        ),
        takeUntilDestroyed(this.ref),
      )
      .subscribe(() => this.refrescar());
  }
  cargar() {
    this.request.run(
      forkJoin({
        videos: this.videosApi.listar(),
        camaras: this.camarasApi.listar(),
        procesamientos: this.api.listar(
          this.filtroEstado || undefined,
          this.filtroCamara || undefined,
        ),
      }),
      (d) => {
        this.videos = d.videos;
        this.camaras = d.camaras;
        this.procesamientos = d.procesamientos;
        this.actualizado = new Date();
      },
    );
  }
  refrescar() {
    this.request.run(
      this.api.listar(this.filtroEstado || undefined, this.filtroCamara || undefined),
      (rows) => {
        this.procesamientos = rows;
        this.actualizado = new Date();
      },
    );
  }
  get activas() {
    return this.camaras.filter((c) => c.estado === 'activa');
  }
  sugerirFecha() {
    const video = this.videos.find((v) => v.id_video === this.videoId);
    this.fechaCaptura = video?.fecha_modificacion.slice(0, 16) || '';
  }
  solicitar() {
    if (this.saving.loading()) return;
    const camara = this.activas.find((c) => c.id === this.camaraId);
    const video = this.videos.find((v) => v.id_video === this.videoId && v.disponible);
    if (!camara || !video || !this.fechaCaptura) {
      this.saving.error.set(
        'Selecciona un video disponible, una cámara activa y la fecha de captura.',
      );
      return;
    }
    if (!camara.zonePolygon) {
      this.saving.error.set('Configura el polígono de la cámara antes de solicitar el análisis.');
      return;
    }
    const epoch = this.mapper.date(this.fechaCaptura).getTime();
    if (!Number.isFinite(epoch) || epoch > Date.now() + 300000) {
      this.saving.error.set('La fecha de captura no puede ser futura.');
      return;
    }
    this.saving.run(
      this.api.solicitar(
        this.videoId,
        this.camaraId,
        this.fechaCaptura.length === 16 ? this.fechaCaptura + ':00' : this.fechaCaptura,
      ),
      (p) => {
        this.mensaje = 'Solicitud #' + p.id + ' registrada: ' + p.estado + '.';
        this.refrescar();
      },
    );
  }
  puedeCancelar(p: Procesamiento) {
    return (
      p.estado === 'pendiente' &&
      (this.auth.isAdmin() || p.usuarioId === this.auth.user()?.id_usuario)
    );
  }
  cancelar(p: Procesamiento) {
    if (!this.puedeCancelar(p) || this.saving.loading()) return;
    this.saving.run(this.api.cancelar(p.id), () => {
      this.mensaje = 'Solicitud cancelada.';
      this.refrescar();
    });
  }
  nombreCamara(id: number | null) {
    return id === null
      ? 'Archivo sin cámara'
      : this.camaras.find((c) => c.id === id)?.nombre || 'Cámara ' + id;
  }
  private renderChart() {
    if (!this.chart) return;
    this.chart.data.labels = this.history.rows.map((i) =>
      i.periodoInicio.toLocaleString('es-PE', {
        timeZone: 'America/Lima',
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    );
    this.chart.data.datasets[0].data = this.history.rows.map((i) => i.promedioPeatones);
    this.chart.update();
  }
  ngOnDestroy() {
    this.chart?.destroy();
  }
}
