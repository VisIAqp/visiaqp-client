import { Location } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { RequestState } from '../../../core/api/request-state';
import { Auth } from '../../../core/auth/auth';
import { Camara } from '../../../core/models/camara.model';
import { Zona } from '../../../core/models/zona.model';
import { CamaraService } from '../../../core/services/camara';
import { ZonaService } from '../../../core/services/zona';
import { ApiState } from '../../../shared/api-state/api-state';
import { BusquedaCatalogo } from '../../../shared/busqueda-catalogo/busqueda-catalogo';

@Component({
  selector: 'app-zonas',
  imports: [ApiState, BusquedaCatalogo, RouterLink],
  templateUrl: './zonas.html',
})
export class Zonas implements OnInit {
  readonly auth = inject(Auth);
  private readonly zonasApi = inject(ZonaService);
  private readonly camarasApi = inject(CamaraService);
  readonly request = new RequestState(inject(DestroyRef), true);
  readonly zonas = signal<Zona[]>([]);
  private readonly camaras = signal<Camara[]>([]);
  readonly busqueda = signal('');
  private readonly estadoNavegacion = inject(Location).getState() as { zonaGuardada?: number } | null;
  readonly mensaje = this.estadoNavegacion?.zonaGuardada ? 'Zona guardada.' : '';

  readonly filas = computed(() => {
    const conteos = new Map<number, number>();
    for (const camara of this.camaras()) {
      conteos.set(camara.zonaId, (conteos.get(camara.zonaId) ?? 0) + 1);
    }

    const consulta = this.busqueda().trim().toLocaleLowerCase('es-PE');
    return this.zonas()
      .filter((zona) => [zona.nombre, zona.ubicacion, zona.pais].some(
        (valor) => valor?.toLocaleLowerCase('es-PE').includes(consulta),
      ))
      .map((zona) => ({ zona, camaras: conteos.get(zona.id) ?? 0 }));
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    if (this.request.loading()) return;
    this.request.run(forkJoin({
      zonas: this.zonasApi.listar(),
      camaras: this.camarasApi.listar(),
    }), ({ zonas, camaras }) => {
      this.zonas.set(zonas);
      this.camaras.set(camaras);
    });
  }
}
