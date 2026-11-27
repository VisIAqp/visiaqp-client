import { CommonModule, Location, ViewportScroller } from '@angular/common';
import { afterNextRender, Component, DestroyRef, inject, Injector, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { distinctUntilChanged, filter, map, timer } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api-config';
import { addDays, exclusiveEnd, limaToday } from '../../../core/api/dates';
import { estadoMedicion, mostrarFecha } from '../../../core/api/metricas-presentacion';
import { RequestState } from '../../../core/api/request-state';
import { Auth } from '../../../core/auth/auth';
import { Procesamiento } from '../../../core/models/analisis.model';
import { Camara } from '../../../core/models/camara.model';
import { EstadoCamara, PuntoSerie } from '../../../core/models/metricas.model';
import { PronosticoOcupacion } from '../../../core/models/pronostico.model';
import { AnalisisService } from '../../../core/services/analisis';
import { CamaraService } from '../../../core/services/camara';
import { MetricasService } from '../../../core/services/metricas';
import { MonitoreoService } from '../../../core/services/monitoreo';
import { PronosticoOcupacion as VistaPronostico } from '../../../shared/pronostico-ocupacion/pronostico-ocupacion';
import { ApiState } from '../../../shared/api-state/api-state';
import { EstadoCamaraBadge } from '../componentes/estado-camara-badge/estado-camara-badge';
import { GraficoPronostico } from './grafico-pronostico';
import { VideoEnVivo } from './video-en-vivo';

@Component({
  selector: 'app-detalle-camara',
  imports: [CommonModule, ApiState, EstadoCamaraBadge, VistaPronostico, GraficoPronostico, VideoEnVivo],
  templateUrl: './detalle-camara.html',
})
export class DetalleCamara implements OnInit {
  private readonly camaras = inject(CamaraService);
  private readonly api = inject(MonitoreoService);
  private readonly metricas = inject(MetricasService);
  private readonly analisis = inject(AnalisisService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly viewport = inject(ViewportScroller);
  private readonly injector = inject(Injector);
  private readonly auth = inject(Auth);
  private readonly config = inject(API_CONFIG);
  private readonly ref = inject(DestroyRef);

  readonly camaraRequest = new RequestState(this.ref, true);
  readonly actividadRequest = new RequestState(this.ref, true);
  readonly medicionRequest = new RequestState(this.ref, true);
  readonly historialRequest = new RequestState(this.ref, true);
  readonly pronosticoRequest = new RequestState(this.ref, true);
  readonly fecha = mostrarFecha;
  readonly estadoMedicion = estadoMedicion;
  readonly idCamara = signal<number | null>(null);
  readonly camara = signal<Camara | null>(null);
  readonly estado = signal<EstadoCamara | null>(null);
  readonly medicion = signal<PuntoSerie | null>(null);
  readonly historial = signal<Procesamiento[]>([]);
  readonly pronostico = signal<PronosticoOcupacion | null>(null);
  readonly hrefMonitoreo = this.location.prepareExternalUrl('/monitoreo');

  ngOnInit() {
    this.route.paramMap.pipe(
      map((params) => {
        const id = Number(params.get('id'));
        return Number.isSafeInteger(id) && id > 0 ? id : null;
      }),
      distinctUntilChanged(),
      takeUntilDestroyed(this.ref),
    ).subscribe((id) => {
      this.limpiarDetalle();
      this.idCamara.set(id);
      this.cargarCamara();
      afterNextRender(() => this.viewport.scrollToPosition([0, 0]), { injector: this.injector });
    });
    timer(this.config.pollMs, this.config.pollMs).pipe(
      filter(() => !document.hidden && this.auth.validToken()),
      takeUntilDestroyed(this.ref),
    ).subscribe(() => this.actualizar());
  }

  volver(evento: MouseEvent) {
    if (evento.button !== 0 || evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.altKey) return;
    evento.preventDefault();
    const estado = this.location.getState() as { desdeMonitoreo?: boolean } | null;
    if (estado?.desdeMonitoreo) this.location.back();
    else void this.router.navigateByUrl('/monitoreo');
  }

  actualizar() {
    this.cargarCamara();
    if (this.camara()) this.consultarDetalle();
  }

  cargarCamara() {
    const id = this.idCamara();
    if (!id || this.camaraRequest.loading()) return;
    this.camaraRequest.run(this.camaras.obtener(id), (camara) => {
      const primeraCarga = this.camara() === null;
      this.camara.set(camara);
      if (primeraCarga) this.consultarDetalle();
    });
  }

  consultarActividad() {
    const id = this.idCamara();
    if (!id || this.actividadRequest.loading()) return;
    this.actividadRequest.run(this.metricas.estadoCamaras({ id_camara: id }), (pagina) => {
      const estado = pagina.datos[0] ?? null;
      if (estado?.id_procesamiento !== this.estado()?.id_procesamiento) {
        this.medicionRequest.reiniciar();
        this.medicion.set(null);
      }
      this.estado.set(estado);
      this.consultarMedicion();
    });
  }

  consultarMedicion() {
    const estado = this.estado();
    if (!estado?.id_procesamiento || this.medicionRequest.loading()) return;
    const hoy = limaToday();
    this.medicionRequest.run(this.metricas.ultimaSerie({
      desde: addDays(hoy, -1) + 'T00:00:00', hasta: exclusiveEnd(hoy)!, periodo: 'hora',
      id_camara: estado.id_camara, id_procesamiento: estado.id_procesamiento, tipo_fuente: 'stream',
    }), (pagina) => this.medicion.set(pagina.datos[0] ?? null));
  }

  consultarHistorial() {
    const id = this.idCamara();
    if (!id || this.historialRequest.loading()) return;
    this.historialRequest.run(this.analisis.listar(undefined, id), (filas) => this.historial.set(filas));
  }

  consultarPronostico() {
    const id = this.idCamara();
    if (!id || this.pronosticoRequest.loading()) return;
    this.pronosticoRequest.run(this.api.pronostico(id, true), (datos) => this.pronostico.set(datos));
  }

  private consultarDetalle() {
    this.consultarActividad();
    this.consultarHistorial();
    this.consultarPronostico();
  }

  private limpiarDetalle() {
    for (const estado of [this.camaraRequest, this.actividadRequest, this.medicionRequest,
      this.historialRequest, this.pronosticoRequest]) estado.reiniciar();
    this.camara.set(null);
    this.estado.set(null);
    this.medicion.set(null);
    this.historial.set([]);
    this.pronostico.set(null);
  }
}
