import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Camara } from '../../core/models/camara.model';
import { Zona } from '../../core/models/zona.model';
import { MonitoreoCamara } from '../../core/models/monitoreo.model';

import { CamaraService } from '../../core/services/camara';
import { ZonaService } from '../../core/services/zona';
import { MonitoreoService } from '../../core/services/monitoreo';

@Component({
  selector: 'app-monitoreo',
  imports: [CommonModule, FormsModule],
  templateUrl: './monitoreo.html',
  styleUrl: './monitoreo.css'
})
export class Monitoreo {

  private camaraService = inject(CamaraService);
  private zonaService = inject(ZonaService);
  private monitoreoService = inject(MonitoreoService);

  camaraSeleccionadaId = 0;

  camaras = this.camaraService.obtenerCamaras();

  get camarasDisponibles(): Camara[] {
    return this.camaras.filter(
      camara => camara.activa && camara.analisisActivo
    );
  }

  get camaraSeleccionada(): Camara | undefined {

    return this.camaraService.obtenerCamaraPorId(
      Number(this.camaraSeleccionadaId)
    );
  }

  get monitoreoSeleccionado(): MonitoreoCamara | undefined {

    if (!this.camaraSeleccionada) {
      return undefined;
    }

    return this.monitoreoService.obtenerPorCamara(
      this.camaraSeleccionada.id
    );
  }

  obtenerZona(zonaId: number): Zona | undefined {
    return this.zonaService.obtenerZonaPorId(zonaId);
  }

  seleccionarCamara(id: number): void {
    this.camaraSeleccionadaId = id;
  }

  simularDeteccion(): void {

    if (!this.camaraSeleccionada) {
      return;
    }

    const cantidad = Math.floor(Math.random() * 100);

    this.monitoreoService.actualizarConteo(
      this.camaraSeleccionada.id,
      cantidad
    );
  }
}