import { afterNextRender, Component, DestroyRef, inject, Injector, OnInit, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { filter, forkJoin, timer } from 'rxjs';
import { API_CONFIG } from '../../core/api/api-config';
import { VideoDto } from '../../core/api/dto';
import { RequestState } from '../../core/api/request-state';
import { Auth } from '../../core/auth/auth';
import { EstadoProcesamiento, Procesamiento } from '../../core/models/analisis.model';
import { Camara } from '../../core/models/camara.model';
import { AnalisisService } from '../../core/services/analisis';
import { CamaraService } from '../../core/services/camara';
import { VideoService } from '../../core/services/video';
import { SeguimientoVideos } from './seguimiento-videos/seguimiento-videos';
import { SolicitudAnalisisVideo, SolicitudVideo } from './solicitud-video/solicitud-video';

@Component({
  selector: 'app-analisis',
  imports: [RouterLink, SeguimientoVideos, SolicitudVideo],
  templateUrl: './analisis.html',
  host: { class: 'block' },
})
export class Analisis implements OnInit {
  private readonly auth = inject(Auth);
  private readonly api = inject(AnalisisService);
  private readonly camarasApi = inject(CamaraService);
  private readonly videosApi = inject(VideoService);
  private readonly config = inject(API_CONFIG);
  private readonly ref = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly seguimiento = viewChild(SeguimientoVideos);

  readonly catalogoRequest = new RequestState(this.ref);
  readonly ejecucionesRequest = new RequestState(this.ref, true);
  readonly envioRequest = new RequestState(this.ref);
  readonly cancelacionRequest = new RequestState(this.ref);
  readonly videos = signal<VideoDto[]>([]);
  readonly camaras = signal<Camara[]>([]);
  readonly destacada = signal<number | null>(null);
  readonly mensajeSeguimiento = signal('');

  private readonly historial = signal<Procesamiento[]>([]);
  get procesamientos() { return this.historial(); }
  set procesamientos(filas: Procesamiento[]) { this.historial.set(filas); }
  filtroEstado: EstadoProcesamiento | '' = '';
  filtroCamara = 0;
  paginaEjecuciones = 1;
  readonly tamanoPagina = 10;

  get paginasEjecuciones() {
    return Math.max(1, Math.ceil(this.procesamientos.length / this.tamanoPagina));
  }

  get ejecucionesVisibles() {
    const inicio = (this.paginaEjecuciones - 1) * this.tamanoPagina;
    return this.procesamientos.slice(inicio, inicio + this.tamanoPagina);
  }

  ngOnInit() {
    this.cargarCatalogo();
    this.refrescar();
    timer(this.config.pollMs, this.config.pollMs).pipe(
      filter(() => !document.hidden && this.auth.validToken() && !this.ejecucionesRequest.loading()
        && !this.envioRequest.loading() && !this.cancelacionRequest.loading()),
      takeUntilDestroyed(this.ref),
    ).subscribe(() => this.refrescar());
  }

  cargarCatalogo() {
    if (this.catalogoRequest.loading()) return;
    this.catalogoRequest.run(
      forkJoin({ videos: this.videosApi.listar(), camaras: this.camarasApi.listar() }),
      ({ videos, camaras }) => {
        this.videos.set(videos);
        this.camaras.set(camaras);
      },
    );
  }

  refrescar(reiniciar = false) {
    if (reiniciar) {
      this.ejecucionesRequest.reiniciar();
      this.procesamientos = [];
      this.paginaEjecuciones = 1;
    }
    this.ejecucionesRequest.run(
      this.api.listar(this.filtroEstado || undefined, this.filtroCamara || undefined, 'video'),
      (filas) => {
        this.procesamientos = filas.filter((fila) => fila.tipoFuente === 'video');
        this.cambiarPagina(0);
      },
    );
  }

  cambiarPagina(delta: number) {
    this.paginaEjecuciones = Math.min(this.paginasEjecuciones, Math.max(1, this.paginaEjecuciones + delta));
  }

  solicitar({ videoId, camaraId, fechaCaptura }: SolicitudAnalisisVideo) {
    if (this.envioRequest.loading()) return;
    this.envioRequest.run(this.api.solicitar(videoId, camaraId, fechaCaptura), (solicitud) => {
      const filas = this.filtroEstado || this.filtroCamara ? [] : this.procesamientos;
      this.filtroEstado = '';
      this.filtroCamara = 0;
      this.paginaEjecuciones = 1;
      this.procesamientos = [solicitud, ...filas.filter((fila) => fila.id !== solicitud.id)];
      this.destacada.set(solicitud.id);
      this.mensajeSeguimiento.set('Solicitud #' + solicitud.id + ' registrada.');
      this.refrescar();
      afterNextRender(() => this.seguimiento()?.enfocarEjecucion(solicitud.id), {
        injector: this.injector,
      });
    });
  }

  readonly puedeCancelar = (fila: Procesamiento) =>
    fila.estado === 'pendiente' && (this.auth.isAdmin() || fila.usuarioId === this.auth.user()?.id_usuario);

  cancelar(fila: Procesamiento) {
    if (!this.puedeCancelar(fila) || this.cancelacionRequest.loading()) return;
    this.cancelacionRequest.run(this.api.cancelar(fila.id), () => {
      this.procesamientos = this.procesamientos.map((proceso) => proceso.id === fila.id
        ? { ...proceso, estado: 'error', mensajeError: 'Cancelado por el usuario' }
        : proceso);
      this.mensajeSeguimiento.set('Solicitud #' + fila.id + ' cancelada.');
      this.refrescar();
    });
  }
}
