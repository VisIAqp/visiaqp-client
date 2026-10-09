import { Injectable } from '@angular/core';
import { Zona } from '../models/zona.model';

@Injectable({
  providedIn: 'root'
})
export class ZonaService {

  private zonas: Zona[] = [
    {
      id: 1,
      nombre: 'Zona UTP - Sede Principal',
      ubicacion: 'Av. Tacna y Arica, Arequipa',
      activa: true
    },
    {
      id: 2,
      nombre: 'Zona Centro Histórico',
      ubicacion: 'Plaza de Armas, Arequipa',
      activa: true
    },
    {
      id: 3,
      nombre: 'Zona Av. Ejército',
      ubicacion: 'Av. Ejército, Cayma',
      activa: true
    }
  ];

  obtenerZonas(): Zona[] {
    return this.zonas;
  }

  obtenerZonaPorId(id: number): Zona | undefined {
    return this.zonas.find(zona => zona.id === id);
  }

  agregarZona(nombre: string, ubicacion: string): void {
    const nuevoId =
      Math.max(0, ...this.zonas.map(zona => zona.id)) + 1;

    this.zonas.push({
      id: nuevoId,
      nombre: nombre.trim(),
      ubicacion: ubicacion.trim(),
      activa: true
    });
  }

  actualizarZona(
    id: number,
    nombre: string,
    ubicacion: string
  ): void {

    const zona = this.obtenerZonaPorId(id);

    if (!zona) {
      return;
    }

    zona.nombre = nombre.trim();
    zona.ubicacion = ubicacion.trim();
  }
}