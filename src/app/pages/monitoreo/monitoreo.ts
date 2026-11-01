import { Component, DestroyRef, inject, OnInit } from '@angular/core';
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
  readonly request = new RequestState(this.ref);
  readonly actividadRequest = new RequestState(this.ref);
  readonly medicionRequest = new RequestState(this.ref);
  readonly historialRequest = new RequestState(this.ref);
  readonly fecha = mostrarFecha;
  readonly estadoMedicion = estadoMedicion;
  camaras: Camara[] = [];
  zonas: Zona[] = [];
  procesamientos: Procesamiento[] = [];
  camaraSeleccionadaId = 0;
  actualizado: Date | null = null;
  estadoActual: EstadoCamara | null = null;
  ultimaMedicion: PuntoSerie | null = null;
  private actividadConsultada = false;
  get camarasDisponibles() { return this.camaras.filter((c) => c.estado === 'activa'); }
  get camaraSeleccionada() { return this.camaras.find((c) => c.id === this.camaraSeleccionadaId); }
  get ejecuciones() { return this.procesamientos.filter((p) => p.camaraId === this.camaraSeleccionadaId); }
  get transmision() { return this.ejecuciones.filter((p) => p.tipoFuente === 'stream').sort((a, b) => b.id - a.id)[0]; }
  get estadoTransmision() {
    if (this.actividadRequest.loading()) return 'Consultando actividad…';
    if (this.actividadRequest.error()) return 'Actividad no disponible';
    if (this.estadoActual) return estadoOperativo(this.estadoActual.estado_operativo);
    if (this.actividadConsultada) return 'Sin estado disponible';
    // Solo para una vista aún no consultada; las respuestas nuevas son la fuente operativa.
    const p = this.transmision;
    if (!p) return 'Sin transmisión registrada';
    if (p.estado !== 'procesando') return p.estado === 'error' ? 'Transmisión interrumpida' : 'Transmisión finalizada';
    if (!p.ultimaActividad) return 'Sin señal de actividad';
    return Date.now() - p.ultimaActividad.getTime() <= (p.limiteInactividadSeg ?? 120) * 1000 ? 'Motor reportando actividad' : 'Sin actividad reciente';
  }
  ngOnInit() {
    this.cargar();
    timer(this.config.pollMs, this.config.pollMs).pipe(
      filter(() => !document.hidden && this.auth.validToken() && !this.request.loading() && !this.actividadRequest.loading() && !this.medicionRequest.loading() && !this.historialRequest.loading()),
      takeUntilDestroyed(this.ref),
    ).subscribe(() => this.cargar());
  }
  cargar() {
    this.request.run(this.api.consultar(), (d) => {
      this.camaras = d.camaras;
      this.zonas = d.zonas;
      this.actualizado = new Date();
      if (!this.camarasDisponibles.some((c) => c.id === this.camaraSeleccionadaId)) {
        this.camaraSeleccionadaId = 0;
        this.limpiarSeleccion();
      } else this.consultarSeleccion();
    });
  }
  private limpiarSeleccion() {
    for (const estado of [this.actividadRequest, this.medicionRequest, this.historialRequest]) {
      estado.cancel(); estado.error.set('');
    }
    this.estadoActual = null; this.ultimaMedicion = null; this.procesamientos = []; this.actividadConsultada = false;
  }
  seleccionarCamara(id: number) { this.camaraSeleccionadaId = id; this.consultarSeleccion(); }
  consultarSeleccion() {
    const id = this.camaraSeleccionadaId;
    this.limpiarSeleccion();
    if (!id) return;
    this.actividadRequest.run(this.metricas.estadoCamaras({ id_camara: id }), (p) => {
      this.actividadConsultada = true;
      this.estadoActual = p.datos[0] ?? null;
      this.consultarMedicion();
    });
    this.historialRequest.run(this.analisis.listar(undefined, id), (p) => this.procesamientos = p);
  }
  consultarMedicion() {
    this.ultimaMedicion = null;
    const estado = this.estadoActual;
    if (!estado?.id_procesamiento) return;
    const hoy = limaToday();
    this.medicionRequest.run(this.metricas.ultimaSerie({ desde: addDays(hoy, -1) + 'T00:00:00',
      hasta: exclusiveEnd(hoy)!, periodo: 'hora', id_camara: estado.id_camara,
      id_procesamiento: estado.id_procesamiento, tipo_fuente: 'stream' }),
      (p) => this.ultimaMedicion = p.datos[0] ?? null);
  }
  nombreZona(id: number) { return this.zonas.find((z) => z.id === id)?.nombre || 'Zona ' + id; }
}
