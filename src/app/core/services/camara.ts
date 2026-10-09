import { Injectable } from '@angular/core';
import { Camara, ConfiguracionCamara } from '../models/camara.model';
@Injectable({ providedIn: 'root' })
export class CamaraService {
  private camaras: Camara[] = [
    { id: 1, nombre: 'Zona de Prueba', zonaId: 1, tipo: 'fija', estado: 'activa', intervaloMuestreoSeg: 60, zonePolygon: [[0.05,0.1],[0.95,0.1],[0.95,0.95],[0.05,0.95]], ultimaConexion: null },
    { id: 2, nombre: 'Cámara UTP', zonaId: 2, tipo: 'fija', estado: 'mantenimiento', intervaloMuestreoSeg: 60, zonePolygon: null, ultimaConexion: null },
    { id: 3, nombre: 'Cámara sin muestras', zonaId: 3, tipo: 'movil', estado: 'inactiva', intervaloMuestreoSeg: 120, zonePolygon: null, ultimaConexion: null }
  ];
  obtenerCamaras() { return this.camaras; }
  obtenerCamaraPorId(id: number) { return this.camaras.find(c => c.id === id); }
  guardarCamara(config: ConfiguracionCamara, id?: number): void {
    if (!config.nombre.trim() || config.nombre.length > 100 || !config.zonaId || !Number.isInteger(config.intervaloMuestreoSeg) || config.intervaloMuestreoSeg <= 0) throw new Error('Revise nombre, zona e intervalo de muestreo.');
    if (!id || config.urlStream.trim()) {
      let valida = false;
      try {
        const url = new URL(config.urlStream.trim());
        valida = ['http:', 'https:', 'rtsp:'].includes(url.protocol) && !!url.hostname && config.urlStream.length <= 255;
      } catch { /* URL inválida: mostrar un mensaje sin incluir credenciales. */ }
      if (!valida) throw new Error('Ingrese una URL HTTP, HTTPS o RTSP válida (máximo 255 caracteres).');
    }
    const datos = { nombre: config.nombre.trim(), zonaId: config.zonaId, tipo: config.tipo, estado: config.estado, intervaloMuestreoSeg: config.intervaloMuestreoSeg };
    if (id) {
      const camara = this.obtenerCamaraPorId(id);
      if (camara) Object.assign(camara, datos);
    } else {
      this.camaras.push({ id: Math.max(0, ...this.camaras.map(c => c.id)) + 1, ...datos, zonePolygon: null, ultimaConexion: null });
    }
    // En modo de prueba no guardamos credenciales de la fuente en la vista pública.
  }
  cambiarEstado(id: number): void {
    const camara = this.obtenerCamaraPorId(id);
    if (camara) camara.estado = camara.estado === 'activa' ? 'inactiva' : 'activa';
  }
  contarCamarasPorZona(zonaId: number) { return this.camaras.filter(c => c.zonaId === zonaId).length; }
}
