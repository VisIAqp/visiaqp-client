import { Location, ViewportScroller } from '@angular/common';
import { afterNextRender, Component, computed, DestroyRef, inject, Injector, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { filter, timer } from 'rxjs';
import { API_CONFIG } from '../../../core/api/api-config';
import { mostrarFecha } from '../../../core/api/metricas-presentacion';
import { RequestState } from '../../../core/api/request-state';
import { Auth } from '../../../core/auth/auth';
import { Camara } from '../../../core/models/camara.model';
import { EstadoCamara } from '../../../core/models/metricas.model';
import { Zona } from '../../../core/models/zona.model';
import { MonitoreoService } from '../../../core/services/monitoreo';
import { ApiState } from '../../../shared/api-state/api-state';
import { EstadoCamaraBadge } from '../componentes/estado-camara-badge/estado-camara-badge';

@Component({
  selector: 'app-monitoreo',
  imports: [RouterLink, ApiState, EstadoCamaraBadge],
  templateUrl: './monitoreo.html',
})
export class Monitoreo implements OnInit {
  private readonly api = inject(MonitoreoService);
  private readonly auth = inject(Auth);
  private readonly config = inject(API_CONFIG);
  private readonly ref = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly location = inject(Location);
  private readonly viewport = inject(ViewportScroller);
  readonly catalogoRequest = new RequestState(this.ref, true);
  readonly actividadRequest = new RequestState(this.ref, true);
  readonly fecha = mostrarFecha;
  readonly origenDetalle = { desdeMonitoreo: true };

  private readonly camaras = signal<Camara[]>([]);
  private readonly zonas = signal<Zona[]>([]);
  private readonly estados = signal<EstadoCamara[]>([]);
  private posicionPendiente: number | undefined =
    (this.location.getState() as { monitoreoScroll?: number } | null)?.monitoreoScroll ?? 0;

  readonly tarjetas = computed(() => {
    const zonas = new Map(this.zonas().map((z) => [z.id, z.nombre]));
    const estados = new Map(this.estados().map((estado) => [estado.id_camara, estado]));
    return this.camaras().filter((camara) => camara.estado === 'activa').map((camara) => ({
      camara,
      zona: zonas.get(camara.zonaId) ?? 'Zona ' + camara.zonaId,
      estado: estados.get(camara.id),
    }));
  });

  ngOnInit() {
    this.actualizar();
    timer(this.config.pollMs, this.config.pollMs).pipe(
      filter(() => !document.hidden && this.auth.validToken()),
      takeUntilDestroyed(this.ref),
    ).subscribe(() => this.actualizar());
  }

  actualizar() {
    this.cargarCatalogo();
    this.cargarActividad();
  }

  cargarCatalogo() {
    if (this.catalogoRequest.loading()) return;
    this.catalogoRequest.run(this.api.consultar(), (datos) => {
      this.camaras.set(datos.camaras);
      this.zonas.set(datos.zonas);
      const posicion = this.posicionPendiente;
      if (posicion !== undefined) {
        this.posicionPendiente = undefined;
        afterNextRender(() => this.viewport.scrollToPosition([0, posicion]), { injector: this.injector });
      }
    });
  }

  cargarActividad() {
    if (this.actividadRequest.loading()) return;
    this.actividadRequest.run(this.api.actividadCamaras(), (estados) => this.estados.set(estados));
  }

  guardarPosicion(evento: MouseEvent) {
    if (evento.button !== 0 || evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.altKey) return;
    this.location.replaceState(this.location.path(), '', {
      ...(this.location.getState() as object),
      monitoreoScroll: this.viewport.getScrollPosition()[1],
    });
  }
}
