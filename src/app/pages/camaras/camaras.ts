import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Camara, TipoFuente } from '../../core/models/camara.model';
import { Zona } from '../../core/models/zona.model';

import { CamaraService } from '../../core/services/camara';
import { ZonaService } from '../../core/services/zona';

@Component({
  selector: 'app-camaras',
  imports: [CommonModule, FormsModule],
  templateUrl: './camaras.html',
  styleUrl: './camaras.css'
})
export class Camaras {

  private camaraService = inject(CamaraService);
  private zonaService = inject(ZonaService);

  busqueda = '';
  mostrarFormulario = false;

  camaraEditando: Camara | null = null;

  camaras = this.camaraService.obtenerCamaras();
  zonas = this.zonaService.obtenerZonas();

  nuevaCamara = {
    nombre: '',
    zonaId: 0,
    tipoFuente: 'RTSP' as TipoFuente,
    fuente: '',
    analisisActivo: true
  };

  get camarasFiltradas(): Camara[] {

    const termino = this.busqueda.toLowerCase().trim();

    if (!termino) {
      return this.camaras;
    }

    return this.camaras.filter(camara => {

      const zona = this.obtenerZona(camara.zonaId);

      return (
        camara.nombre.toLowerCase().includes(termino) ||
        zona?.nombre.toLowerCase().includes(termino)
      );
    });
  }

  get camarasActivas(): number {
    return this.camaras.filter(
      camara => camara.activa
    ).length;
  }

  get camarasAnalizando(): number {
    return this.camaras.filter(
      camara => camara.analisisActivo
    ).length;
  }

  obtenerZona(zonaId: number): Zona | undefined {
    return this.zonaService.obtenerZonaPorId(zonaId);
  }

  abrirFormulario(): void {

    this.camaraEditando = null;

    this.nuevaCamara = {
      nombre: '',
      zonaId: 0,
      tipoFuente: 'RTSP',
      fuente: '',
      analisisActivo: true
    };

    this.mostrarFormulario = true;
  }

  editarCamara(camara: Camara): void {

    this.camaraEditando = camara;

    this.nuevaCamara = {
      nombre: camara.nombre,
      zonaId: camara.zonaId,
      tipoFuente: camara.tipoFuente,
      fuente: camara.fuente,
      analisisActivo: camara.analisisActivo
    };

    this.mostrarFormulario = true;
  }

  guardarCamara(): void {

    const nombre = this.nuevaCamara.nombre.trim();
    const zonaId = Number(this.nuevaCamara.zonaId);
    const fuente = this.nuevaCamara.fuente.trim();

    if (!nombre || !zonaId || !fuente) {
      return;
    }

    if (this.camaraEditando) {

      this.camaraService.actualizarCamara(
        this.camaraEditando.id,
        nombre,
        zonaId,
        this.nuevaCamara.tipoFuente,
        fuente,
        this.nuevaCamara.analisisActivo
      );

    } else {

      this.camaraService.agregarCamara(
        nombre,
        zonaId,
        this.nuevaCamara.tipoFuente,
        fuente,
        this.nuevaCamara.analisisActivo
      );
    }

    this.cerrarFormulario();
  }

  cambiarEstado(camara: Camara): void {
    this.camaraService.cambiarEstado(camara.id);
  }

  cerrarFormulario(): void {

    this.mostrarFormulario = false;
    this.camaraEditando = null;

    this.nuevaCamara = {
      nombre: '',
      zonaId: 0,
      tipoFuente: 'RTSP',
      fuente: '',
      analisisActivo: true
    };
  }
}