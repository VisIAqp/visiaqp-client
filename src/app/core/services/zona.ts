import { zonasAdicionales } from '../data/demo';
import { Injectable } from '@angular/core';
import { Zona } from '../models/zona.model';
@Injectable({ providedIn: 'root' })
export class ZonaService {
  private zonas: Zona[] = [
    { id: 1, nombre: 'Plaza de Armas', descripcion: 'Zona de prueba', ubicacion: 'Arequipa, Perú', pais: 'PE', latitud: -16.3988, longitud: -71.5369, estado: 'activa' },
    { id: 2, nombre: 'Zona UTP', descripcion: null, ubicacion: 'Arequipa, Perú', pais: 'PE', latitud: null, longitud: null, estado: 'activa' },
    { id: 3, nombre: 'Zona sin muestras', descripcion: null, ubicacion: null, pais: 'PE', latitud: null, longitud: null, estado: 'inactiva' },
    ...zonasAdicionales
  ];
  obtenerZonas() { return this.zonas; }
  obtenerZonaPorId(id: number) { return this.zonas.find(z => z.id === id); }
  agregarZona(nombre: string, ubicacion: string): void {
    this.zonas.push({ id: Math.max(0, ...this.zonas.map(z => z.id)) + 1, nombre: nombre.trim(), ubicacion: ubicacion.trim() || null, descripcion: null, pais: 'PE', latitud: null, longitud: null, estado: 'activa' });
  }
  actualizarZona(id: number, nombre: string, ubicacion: string): void {
    const zona = this.obtenerZonaPorId(id);
    if (zona) Object.assign(zona, { nombre: nombre.trim(), ubicacion: ubicacion.trim() || null });
  }
}
