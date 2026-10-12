import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Auth } from '../../core/auth/auth';
import { RequestState } from '../../core/api/request-state';
import { ApiState } from '../../shared/api-state/api-state';
import { Camara, ConfiguracionCamara } from '../../core/models/camara.model';
import { Zona } from '../../core/models/zona.model';
import { CamaraService } from '../../core/services/camara';
import { ZonaService } from '../../core/services/zona';
const formulario = (): ConfiguracionCamara => ({
  nombre: '',
  zonaId: 0,
  tipo: 'fija',
  estado: 'activa',
  intervaloMuestreoSeg: 60,
  urlStream: '',
  zonePolygon: null,
});
@Component({
  selector: 'app-camaras',
  imports: [CommonModule, FormsModule, ApiState],
  templateUrl: './camaras.html',
})
export class Camaras implements OnInit {
  readonly auth = inject(Auth);
  private api = inject(CamaraService);
  private zonasApi = inject(ZonaService);
  private ref = inject(DestroyRef);
  readonly request = new RequestState(this.ref);
  readonly saving = new RequestState(this.ref);
  camaras: Camara[] = [];
  zonas: Zona[] = [];
  busqueda = '';
  mostrarFormulario = false;
  camaraEditando: Camara | null = null;
  nuevaCamara = formulario();
  poligono = '';
  mensaje = '';
  ngOnInit() {
    this.cargar();
  }
  cargar() {
    this.request.run(
      forkJoin({ camaras: this.api.listar(), zonas: this.zonasApi.listar() }),
      (d) => {
        this.camaras = d.camaras;
        this.zonas = d.zonas;
      },
    );
  }
  get camarasFiltradas() {
    const q = this.busqueda.toLowerCase().trim();
    return this.camaras.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) || this.nombreZona(c.zonaId).toLowerCase().includes(q),
    );
  }
  nombreZona(id: number) {
    return this.zonas.find((z) => z.id === id)?.nombre || 'Zona ' + id;
  }
  abrirFormulario() {
    if (!this.auth.isAdmin()) return;
    this.camaraEditando = null;
    this.nuevaCamara = formulario();
    this.poligono = '';
    this.mensaje = '';
    this.saving.error.set('');
    this.mostrarFormulario = true;
  }
  editarCamara(c: Camara) {
    if (!this.auth.isAdmin()) return;
    this.camaraEditando = c;
    this.nuevaCamara = {
      nombre: c.nombre,
      zonaId: c.zonaId,
      tipo: c.tipo,
      estado: c.estado,
      intervaloMuestreoSeg: c.intervaloMuestreoSeg,
      urlStream: '',
      zonePolygon: c.zonePolygon,
    };
    this.poligono = c.zonePolygon ? JSON.stringify(c.zonePolygon) : '';
    this.saving.error.set('');
    this.mostrarFormulario = true;
  }
  cerrarFormulario() {
    if (this.saving.loading()) return;
    this.mostrarFormulario = false;
    this.nuevaCamara = formulario();
    this.poligono = '';
    this.camaraEditando = null;
  }
  guardarCamara() {
    if (!this.auth.isAdmin() || this.saving.loading()) return;
    const d = this.nuevaCamara;
    if (
      !d.nombre.trim() ||
      !d.zonaId ||
      !Number.isInteger(d.intervaloMuestreoSeg) ||
      d.intervaloMuestreoSeg < 1
    ) {
      this.saving.error.set('Revisa nombre, zona e intervalo de muestreo.');
      return;
    }
    if (!this.camaraEditando && !d.urlStream.trim()) {
      this.saving.error.set('Indica la fuente de video para registrar la cámara.');
      return;
    }
    try {
      const value = this.poligono.trim() ? JSON.parse(this.poligono) : null;
      if (
        value !== null &&
        (!Array.isArray(value) ||
          value.length < 3 ||
          value.some(
            (p: unknown) =>
              !Array.isArray(p) ||
              p.length !== 2 ||
              p.some((n) => typeof n !== 'number' || !Number.isFinite(n) || n < 0 || n > 1),
          ))
      )
        throw new Error();
      d.zonePolygon = value;
    } catch {
      this.saving.error.set(
        'El polígono necesita al menos tres puntos [x,y], con coordenadas entre 0 y 1.',
      );
      return;
    }
    this.saving.run(this.api.guardar(d, this.camaraEditando?.id), () => {
      this.mostrarFormulario = false;
      this.nuevaCamara = formulario();
      this.poligono = '';
      this.camaraEditando = null;
      this.mensaje = 'Cámara guardada.';
      this.cargar();
    });
  }
  cambiarEstado(c: Camara) {
    if (!this.auth.isAdmin() || this.saving.loading()) return;
    this.saving.run(
      this.api.cambiarEstado(c.id, c.estado === 'activa' ? 'inactiva' : 'activa'),
      () => this.cargar(),
    );
  }
}
