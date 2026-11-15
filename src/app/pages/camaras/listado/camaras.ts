import { Location } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { RequestState } from '../../../core/api/request-state';
import { Auth } from '../../../core/auth/auth';
import { Camara, EstadoCamara } from '../../../core/models/camara.model';
import { Zona } from '../../../core/models/zona.model';
import { CamaraService } from '../../../core/services/camara';
import { ZonaService } from '../../../core/services/zona';
import { ApiState } from '../../../shared/api-state/api-state';
import { BusquedaCatalogo } from '../../../shared/busqueda-catalogo/busqueda-catalogo';

const configuraciones: Record<EstadoCamara, { etiqueta: string; estilo: string }> = {
  activa: { etiqueta: 'Habilitada', estilo: 'bg-success-soft text-success' },
  inactiva: { etiqueta: 'Deshabilitada', estilo: 'bg-canvas text-muted' },
  mantenimiento: { etiqueta: 'En mantenimiento', estilo: 'bg-warning-soft text-warning' },
};

@Component({
  selector: 'app-camaras',
  imports: [ApiState, BusquedaCatalogo, RouterLink],
  templateUrl: './camaras.html',
})
export class Camaras implements OnInit {
  readonly auth = inject(Auth);
  private readonly api = inject(CamaraService);
  private readonly zonasApi = inject(ZonaService);
  private readonly ref = inject(DestroyRef);
  readonly request = new RequestState(this.ref, true);
  readonly saving = new RequestState(this.ref);
  readonly configuraciones = configuraciones;
  readonly camaras = signal<Camara[]>([]);
  private readonly zonas = signal<Zona[]>([]);
  private readonly parametros = toSignal(inject(ActivatedRoute).queryParamMap);
  readonly zonaId = computed(() => {
    const id = Number(this.parametros()?.get('zona'));
    return Number.isSafeInteger(id) && id > 0 ? id : null;
  });
  readonly nombreZonaFiltrada = computed(() => {
    const id = this.zonaId();
    return id === null ? null : this.zonas().find((zona) => zona.id === id)?.nombre ?? 'Zona ' + id;
  });
  readonly busqueda = signal('');
  private readonly estadoNavegacion = inject(Location).getState() as { camaraGuardada?: number } | null;
  readonly mensaje = signal(this.estadoNavegacion?.camaraGuardada ? 'Cámara guardada.' : '');

  readonly camarasEnZona = computed(() => {
    const id = this.zonaId();
    const camaras = this.camaras();
    return id === null ? camaras : camaras.filter((camara) => camara.zonaId === id);
  });

  readonly filas = computed(() => {
    const zonas = new Map(this.zonas().map((zona) => [zona.id, zona.nombre]));
    const consulta = this.busqueda().trim().toLocaleLowerCase('es-PE');
    return this.camarasEnZona().map((camara) => ({
      camara,
      zona: zonas.get(camara.zonaId) ?? 'Zona ' + camara.zonaId,
    })).filter(({ camara, zona }) =>
      camara.nombre.toLocaleLowerCase('es-PE').includes(consulta) || zona.toLocaleLowerCase('es-PE').includes(consulta));
  });

  ngOnInit() { this.cargar(); }

  cargar() {
    if (this.request.loading()) return;
    this.request.run(forkJoin({
      camaras: this.api.listar(), zonas: this.zonasApi.listar(),
    }), ({ camaras, zonas }) => {
      this.camaras.set(camaras);
      this.zonas.set(zonas);
    });
  }

  cambiarEstado(camara: Camara) {
    if (!this.auth.isAdmin() || this.saving.loading()) return;
    this.mensaje.set('');
    this.saving.run(
      this.api.cambiarEstado(camara.id, camara.estado === 'activa' ? 'inactiva' : 'activa'),
      (actualizada) => {
        this.camaras.update((filas) => filas.map((fila) => fila.id === actualizada.id ? actualizada : fila));
        this.mensaje.set(actualizada.estado === 'activa' ? 'Cámara habilitada.' : 'Cámara deshabilitada.');
      },
    );
  }
}
