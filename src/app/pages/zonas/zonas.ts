import { Component, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { Zona } from '../../core/models/zona.model';
import { ZonaService } from '../../core/services/zona';
import { CamaraService } from '../../core/services/camara';

@Component({
  selector: 'app-zonas',
  imports: [FormsModule],
  templateUrl: './zonas.html',
  styleUrl: './zonas.css'
})
export class Zonas {

  private zonaService = inject(ZonaService);
  private camaraService = inject(CamaraService);

  mostrarFormulario = false;
  busqueda = '';

  zonaEditando: Zona | null = null;

  nuevaZona = {
    nombre: '',
    ubicacion: ''
  };

  zonas = this.zonaService.obtenerZonas();

  get zonasFiltradas(): Zona[] {

    const termino = this.busqueda.toLowerCase().trim();

    if (!termino) {
      return this.zonas;
    }

    return this.zonas.filter(zona =>
      zona.nombre.toLowerCase().includes(termino) ||
      (zona.ubicacion ?? '').toLowerCase().includes(termino)
    );
  }

  get zonasActivas(): number {
    return this.zonas.filter(zona => zona.estado === 'activa').length;
  }

  get totalCamaras(): number {
    return this.camaraService.obtenerCamaras().length;
  }

  contarCamaras(zonaId: number): number {
    return this.camaraService.contarCamarasPorZona(zonaId);
  }

  abrirFormulario(): void {

    this.zonaEditando = null;

    this.nuevaZona = {
      nombre: '',
      ubicacion: ''
    };

    this.mostrarFormulario = true;
  }

  editarZona(zona: Zona): void {

    this.zonaEditando = zona;

    this.nuevaZona = {
      nombre: zona.nombre,
      ubicacion: zona.ubicacion ?? ''
    };

    this.mostrarFormulario = true;
  }

  guardarZona(): void {

    const nombre = this.nuevaZona.nombre.trim();
    const ubicacion = this.nuevaZona.ubicacion.trim();

    if (!nombre || nombre.length > 100 || ubicacion.length > 150) {
      return;
    }

    if (this.zonaEditando) {

      this.zonaService.actualizarZona(
        this.zonaEditando.id,
        nombre,
        ubicacion
      );

    } else {

      this.zonaService.agregarZona(
        nombre,
        ubicacion
      );
    }

    this.cerrarFormulario();
  }

  cerrarFormulario(): void {

    this.mostrarFormulario = false;
    this.zonaEditando = null;

    this.nuevaZona = {
      nombre: '',
      ubicacion: ''
    };
  }
}