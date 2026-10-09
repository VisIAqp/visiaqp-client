import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AnalisisService } from '../../core/services/analisis';
import { CamaraService } from '../../core/services/camara';
import { ZonaService } from '../../core/services/zona';

import { RegistroAnalisis } from '../../core/models/analisis.model';

@Component({
  selector: 'app-reportes',
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css'
})
export class Reportes {

  private analisisService = inject(AnalisisService);
  private camaraService = inject(CamaraService);
  private zonaService = inject(ZonaService);

  zonas = this.zonaService.obtenerZonas();
  camaras = this.camaraService.obtenerCamaras();
  registros = this.analisisService.obtenerRegistros();

  zonaSeleccionada = 0;
  camaraSeleccionada = 0;

  fechaInicio = '';
  fechaFin = '';

  mensaje = '';

  get camarasDisponibles() {

    if (!this.zonaSeleccionada) {
      return this.camaras;
    }

    return this.camaras.filter(
      camara =>
        camara.zonaId === Number(this.zonaSeleccionada)
    );
  }

  get registrosFiltrados(): RegistroAnalisis[] {

    return this.registros.filter(registro => {

      const camara =
        this.camaraService.obtenerCamaraPorId(
          registro.camaraId
        );

      if (!camara) {
        return false;
      }

      const coincideZona =
        !this.zonaSeleccionada ||
        camara.zonaId === Number(this.zonaSeleccionada);

      const coincideCamara =
        !this.camaraSeleccionada ||
        registro.camaraId === Number(this.camaraSeleccionada);

      let coincideFechaInicio = true;
      let coincideFechaFin = true;

      if (this.fechaInicio) {

        const inicio = new Date(
          this.fechaInicio + 'T00:00:00'
        );

        coincideFechaInicio =
          registro.fecha >= inicio;
      }

      if (this.fechaFin) {

        const fin = new Date(
          this.fechaFin + 'T23:59:59'
        );

        coincideFechaFin =
          registro.fecha <= fin;
      }

      return (
        coincideZona &&
        coincideCamara &&
        coincideFechaInicio &&
        coincideFechaFin
      );
    });
  }

  get totalPeatones(): number {

    return this.registrosFiltrados.reduce(
      (total, registro) =>
        total + registro.peatonesDetectados,
      0
    );
  }

  get maximoPeatones(): number {

    if (!this.registrosFiltrados.length) {
      return 0;
    }

    return Math.max(
      ...this.registrosFiltrados.map(
        registro => registro.peatonesDetectados
      )
    );
  }

  get promedioPeatones(): number {

    if (!this.registrosFiltrados.length) {
      return 0;
    }

    return Math.round(
      this.totalPeatones /
      this.registrosFiltrados.length
    );
  }

  obtenerNombreCamara(camaraId: number): string {

    return (
      this.camaraService
        .obtenerCamaraPorId(camaraId)?.nombre ??
      'Cámara desconocida'
    );
  }

  obtenerNombreZona(camaraId: number): string {

    const camara =
      this.camaraService.obtenerCamaraPorId(camaraId);

    if (!camara) {
      return 'Zona desconocida';
    }

    return (
      this.zonaService
        .obtenerZonaPorId(camara.zonaId)?.nombre ??
      'Zona desconocida'
    );
  }

  cambiarZona(): void {

    if (
      this.camaraSeleccionada &&
      !this.camarasDisponibles.some(
        camara =>
          camara.id === Number(this.camaraSeleccionada)
      )
    ) {
      this.camaraSeleccionada = 0;
    }

    this.mensaje = '';
  }

  limpiarFiltros(): void {

    this.zonaSeleccionada = 0;
    this.camaraSeleccionada = 0;
    this.fechaInicio = '';
    this.fechaFin = '';
    this.mensaje = '';
  }

  exportarPDF(): void {

    this.mensaje =
      `PDF preparado con ${this.registrosFiltrados.length} registros. ` +
      'La generación del archivo se conectará posteriormente.';
  }

  exportarExcel(): void {

    this.mensaje =
      `Excel preparado con ${this.registrosFiltrados.length} registros. ` +
      'La generación del archivo se conectará posteriormente.';
  }
}