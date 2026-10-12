import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { filter, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Auth } from '../../core/auth/auth';
import { API_CONFIG } from '../../core/api/api-config';
import { RequestState } from '../../core/api/request-state';
import { ApiState } from '../../shared/api-state/api-state';
import { MonitoreoService } from '../../core/services/monitoreo';
import { Camara } from '../../core/models/camara.model';
import { Zona } from '../../core/models/zona.model';
import { Indicador } from '../../core/models/indicador.model';
import { Procesamiento } from '../../core/models/analisis.model';
@Component({
  selector: 'app-monitoreo',
  imports: [CommonModule, ApiState],
  templateUrl: './monitoreo.html',
})
export class Monitoreo implements OnInit {
  private api = inject(MonitoreoService);
  private auth = inject(Auth);
  private config = inject(API_CONFIG);
  private ref = inject(DestroyRef);
  readonly request = new RequestState(this.ref);
  camaras: Camara[] = [];
  zonas: Zona[] = [];
  indicadores: Indicador[] = [];
  procesamientos: Procesamiento[] = [];
  camaraSeleccionadaId = 0;
  actualizado: Date | null = null;
  get camarasDisponibles() {
    return this.camaras.filter((c) => c.estado === 'activa');
  }
  get camaraSeleccionada() {
    return this.camaras.find((c) => c.id === this.camaraSeleccionadaId);
  }
  get indicador() {
    return this.indicadores.find((i) => i.zonaId === this.camaraSeleccionada?.zonaId);
  }
  get ejecuciones() {
    return this.procesamientos.filter((p) => p.camaraId === this.camaraSeleccionadaId);
  }
  ngOnInit() {
    this.cargar();
    timer(this.config.pollMs, this.config.pollMs)
      .pipe(
        filter(() => !document.hidden && this.auth.validToken() && !this.request.loading()),
        takeUntilDestroyed(this.ref),
      )
      .subscribe(() => this.cargar());
  }
  cargar() {
    this.request.run(this.api.consultar(), (d) => {
      this.camaras = d.camaras;
      this.zonas = d.zonas;
      this.indicadores = d.indicadores;
      this.procesamientos = d.procesamientos;
      this.actualizado = new Date();
      if (!this.camarasDisponibles.some((c) => c.id === this.camaraSeleccionadaId))
        this.camaraSeleccionadaId = 0;
    });
  }
  seleccionarCamara(id: number) {
    this.camaraSeleccionadaId = id;
  }
  nombreZona(id: number) {
    return this.zonas.find((z) => z.id === id)?.nombre || 'Zona ' + id;
  }
}
