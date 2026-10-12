import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Auth } from '../../core/auth/auth';
import { RequestState } from '../../core/api/request-state';
import { ApiState } from '../../shared/api-state/api-state';
import { ZonaService } from '../../core/services/zona';
import { CamaraService } from '../../core/services/camara';
import { UmbralService } from '../../core/services/umbral';
import { Zona } from '../../core/models/zona.model';
import { Camara } from '../../core/models/camara.model';
@Component({
  selector: 'app-zonas',
  imports: [CommonModule, FormsModule, ApiState],
  templateUrl: './zonas.html',
})
export class Zonas implements OnInit {
  readonly auth = inject(Auth);
  private api = inject(ZonaService);
  private camarasApi = inject(CamaraService);
  private umbralApi = inject(UmbralService);
  private destroyRef = inject(DestroyRef);
  readonly request = new RequestState(this.destroyRef);
  readonly saving = new RequestState(this.destroyRef);
  readonly threshold = new RequestState(this.destroyRef);
  zonas: Zona[] = [];
  camaras: Camara[] = [];
  busqueda = '';
  mostrarFormulario = false;
  zonaEditando: Zona | null = null;
  mensaje = '';
  umbralZona = 0;
  medio = 10;
  alto = 30;
  umbralPredeterminado = false;
  nuevaZona = {
    nombre: '',
    ubicacion: '',
    descripcion: '',
    pais: 'PE',
    latitud: null as number | null,
    longitud: null as number | null,
    estado: 'activa' as 'activa' | 'inactiva',
  };
  ngOnInit() {
    this.cargar();
  }
  cargar() {
    this.request.run(
      forkJoin({ zonas: this.api.listar(), camaras: this.camarasApi.listar() }),
      (d) => {
        this.zonas = d.zonas;
        this.camaras = d.camaras;
      },
    );
  }
  get zonasFiltradas() {
    const q = this.busqueda.toLowerCase().trim();
    return this.zonas.filter(
      (z) => z.nombre.toLowerCase().includes(q) || (z.ubicacion || '').toLowerCase().includes(q),
    );
  }
  contarCamaras(id: number) {
    return this.camaras.filter((c) => c.zonaId === id).length;
  }
  abrirFormulario() {
    if (!this.auth.isAdmin()) return;
    this.zonaEditando = null;
    this.nuevaZona = {
      nombre: '',
      ubicacion: '',
      descripcion: '',
      pais: 'PE',
      latitud: null,
      longitud: null,
      estado: 'activa',
    };
    this.mostrarFormulario = true;
    this.saving.error.set('');
  }
  editarZona(z: Zona) {
    if (!this.auth.isAdmin()) return;
    this.zonaEditando = z;
    this.nuevaZona = {
      nombre: z.nombre,
      ubicacion: z.ubicacion || '',
      descripcion: z.descripcion || '',
      pais: z.pais,
      latitud: z.latitud,
      longitud: z.longitud,
      estado: z.estado,
    };
    this.mostrarFormulario = true;
    this.saving.error.set('');
  }
  cerrarFormulario() {
    if (this.saving.loading()) return;
    this.mostrarFormulario = false;
    this.zonaEditando = null;
  }
  guardarZona() {
    if (!this.auth.isAdmin() || this.saving.loading() || !this.nuevaZona.nombre.trim()) return;
    const d = this.nuevaZona;
    this.saving.run(
      this.api.guardar(
        {
          nombre: d.nombre.trim(),
          ubicacion: d.ubicacion.trim() || null,
          descripcion: d.descripcion.trim() || null,
          pais: d.pais,
          latitud: d.latitud,
          longitud: d.longitud,
          ...(this.zonaEditando ? { estado: d.estado } : {}),
        },
        this.zonaEditando?.id,
      ),
      () => {
        this.mostrarFormulario = false;
        this.zonaEditando = null;
        this.mensaje = 'Zona guardada.';
        this.cargar();
      },
    );
  }
  verUmbral(id: number) {
    this.umbralZona = id;
    this.threshold.run(this.umbralApi.obtener(id), (u) => {
      this.umbralPredeterminado = !u;
      this.medio = u?.umbral_medio ?? 10;
      this.alto = u?.umbral_alto ?? 30;
    });
  }
  guardarUmbral() {
    if (!this.auth.isAdmin() || this.threshold.loading() || this.alto <= this.medio) return;
    this.threshold.run(this.umbralApi.guardar(this.umbralZona, this.medio, this.alto), () => {
      this.umbralPredeterminado = false;
      this.mensaje = 'Umbral guardado. El backend recalcula las últimas 48 horas.';
    });
  }
}
