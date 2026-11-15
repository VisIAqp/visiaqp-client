import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { filter, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Auth } from '../../core/auth/auth';
import { API_CONFIG } from '../../core/api/api-config';
import { RequestState } from '../../core/api/request-state';
import { ApiState } from '../../shared/api-state/api-state';
import { MonitoreoService } from '../../core/services/monitoreo';
import { MetricasService } from '../../core/services/metricas';
import { AnalisisService } from '../../core/services/analisis';
import { Camara } from '../../core/models/camara.model';
import { Zona } from '../../core/models/zona.model';
import { Procesamiento } from '../../core/models/analisis.model';
import { EstadoCamara, PuntoSerie } from '../../core/models/metricas.model';
import { PronosticoOcupacion } from '../../core/models/pronostico.model';
import { addDays, exclusiveEnd, limaToday } from '../../core/api/dates';
import { estadoMedicion, estadoOperativo, mostrarFecha } from '../../core/api/metricas-presentacion';

@Component({ selector: 'app-monitoreo', imports: [CommonModule, ApiState], templateUrl: './monitoreo.html' })
export class Monitoreo implements OnInit {
  private api = inject(MonitoreoService);
  private metricas = inject(MetricasService);
  private analisis = inject(AnalisisService);
  private auth = inject(Auth);
  private config = inject(API_CONFIG);
  private ref = inject(DestroyRef);
  readonly request = new RequestState(this.ref, true);
  readonly actividadRequest = new RequestState(this.ref, true);
  readonly medicionRequest = new RequestState(this.ref, true);
  readonly historialRequest = new RequestState(this.ref, true);
  readonly pronosticoRequest = new RequestState(this.ref, true);
  readonly fecha = mostrarFecha;
  readonly estadoMedicion = estadoMedicion;
  private readonly camaras = signal<Camara[]>([]);
  private readonly zonas = signal<Zona[]>([]);
  procesamientos: Procesamiento[] = [];
  camaraSeleccionadaId = 0;
  readonly estadoActual = signal<EstadoCamara | null>(null);
  private readonly medicion = signal<PuntoSerie | null>(null);
  readonly pronostico = signal<PronosticoOcupacion | null>(null);
  readonly camarasDisponibles = computed(() => this.camaras().filter((c) => c.estado === 'activa'));
  get camaraSeleccionada() {
    return this.camarasDisponibles().find((c) => c.id === this.camaraSeleccionadaId);
  }
  get ejecuciones() { return this.procesamientos.filter((p) => p.camaraId === this.camaraSeleccionadaId); }
  get ultimaMedicion() { return this.medicion(); }
  get estadoTransmision() {
    const estado = this.estadoActual();
    if (estado) return estadoOperativo(estado.estado_operativo);
    if (this.actividadRequest.actualizado()) return 'Sin estado disponible';
    if (this.actividadRequest.cargaInicial()) return 'Consultando actividad.';
    if (this.actividadRequest.error()) return 'Actividad no disponible';
    const p = this.ejecuciones.filter((e) => e.tipoFuente === 'stream').sort((a, b) => b.id - a.id)[0];
    if (!p) return 'Sin transmisión registrada';
    if (p.estado !== 'procesando') return p.estado === 'error' ? 'Transmisión interrumpida' : 'Transmisión finalizada';
    if (!p.ultimaActividad) return 'Sin señal de actividad';
    return Date.now() - p.ultimaActividad.getTime() <= (p.limiteInactividadSeg ?? 120) * 1000 ? 'Motor reportando actividad' : 'Sin actividad reciente';
  }
  ngOnInit() {
    this.cargar();
    timer(this.config.pollMs, this.config.pollMs).pipe(
      filter(() => !document.hidden && this.auth.validToken()),
      takeUntilDestroyed(this.ref),
    ).subscribe(() => this.cargar());
  }
  cargar() {
    this.cargarCatalogo();
    this.consultarSeleccion();
  }
  cargarCatalogo() {
    if (this.request.loading()) return;
    this.request.run(this.api.consultar(), (d) => {
      this.camaras.set(d.camaras);
      this.zonas.set(d.zonas);
      if (this.camaraSeleccionadaId && !this.camaraSeleccionada) this.seleccionarCamara(0);
    });
  }
  seleccionarCamara(id: number) {
    if (id !== this.camaraSeleccionadaId) {
      this.limpiarSeleccion();
      this.camaraSeleccionadaId = id;
    }
    this.consultarSeleccion();
  }
  private limpiarSeleccion() {
    for (const estado of [this.actividadRequest, this.medicionRequest, this.historialRequest, this.pronosticoRequest]) {
      estado.reiniciar();
    }
    this.estadoActual.set(null);
    this.medicion.set(null);
    this.procesamientos = [];
    this.pronostico.set(null);
  }
  private consultarSeleccion() {
    this.consultarActividad();
    this.consultarHistorial();
    this.consultarPronostico();
  }
  consultarActividad() {
    const id = this.camaraSeleccionadaId;
    if (!id || this.actividadRequest.loading()) return;
    this.actividadRequest.run(this.metricas.estadoCamaras({ id_camara: id }), (p) => {
      const estado = p.datos[0] ?? null;
      if (estado?.id_procesamiento !== this.estadoActual()?.id_procesamiento) {
        this.medicionRequest.reiniciar();
        this.medicion.set(null);
      }
      this.estadoActual.set(estado);
      this.consultarMedicion();
    });
  }
  consultarHistorial() {
    const id = this.camaraSeleccionadaId;
    if (!id || this.historialRequest.loading()) return;
    this.historialRequest.run(this.analisis.listar(undefined, id), (p) => this.procesamientos = p);
  }
  consultarPronostico() {
    const id = this.camaraSeleccionadaId;
    if (!id || this.pronosticoRequest.loading()) return;
    this.pronosticoRequest.run(this.api.pronostico(id), (p) => this.pronostico.set(p));
  }
  consultarMedicion() {
    const estado = this.estadoActual();
    if (!estado?.id_procesamiento || this.medicionRequest.loading()) return;
    const hoy = limaToday();
    this.medicionRequest.run(this.metricas.ultimaSerie({ desde: addDays(hoy, -1) + 'T00:00:00',
      hasta: exclusiveEnd(hoy)!, periodo: 'hora', id_camara: estado.id_camara,
      id_procesamiento: estado.id_procesamiento, tipo_fuente: 'stream' }),
      (p) => this.medicion.set(p.datos[0] ?? null));
  }
  nombreZona(id: number) { return this.zonas().find((z) => z.id === id)?.nombre || 'Zona ' + id; }
}
