import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Camara, ConfiguracionCamara } from '../../core/models/camara.model';
import { CamaraService } from '../../core/services/camara';
import { ZonaService } from '../../core/services/zona';
import { AnalisisService } from '../../core/services/analisis';
const formulario = (): ConfiguracionCamara => ({ nombre: '', zonaId: 0, tipo: 'fija', estado: 'activa', intervaloMuestreoSeg: 60, urlStream: '' });
@Component({ selector: 'app-camaras', imports: [CommonModule, FormsModule], templateUrl: './camaras.html' })
export class Camaras {
  private camaraService = inject(CamaraService);
  private zonaService = inject(ZonaService);
  private analisisService = inject(AnalisisService);
  busqueda = '';
  mostrarFormulario = false;
  mensaje = '';
  camaraEditando: Camara | null = null;
  camaras = this.camaraService.obtenerCamaras();
  zonas = this.zonaService.obtenerZonas();
  nuevaCamara = formulario();
  get camarasFiltradas() {
    const texto = this.busqueda.toLowerCase().trim();
    return this.camaras.filter(c => c.nombre.toLowerCase().includes(texto) || this.obtenerZona(c.zonaId)?.nombre.toLowerCase().includes(texto));
  }
  get camarasActivas() { return this.camaras.filter(c => c.estado === 'activa').length; }
  get camarasAnalizando() { return this.camaras.filter(c => c.estado === 'activa' && this.estaAnalizando(c.id)).length; }
  estaAnalizando(id: number) { return this.analisisService.estaAnalizando(id); }
  obtenerZona(id: number) { return this.zonaService.obtenerZonaPorId(id); }
  abrirFormulario() { this.camaraEditando = null; this.nuevaCamara = formulario(); this.mensaje = ''; this.mostrarFormulario = true; }
  editarCamara(c: Camara) { this.camaraEditando = c; this.nuevaCamara = { nombre: c.nombre, zonaId: c.zonaId, tipo: c.tipo, estado: c.estado, intervaloMuestreoSeg: c.intervaloMuestreoSeg, urlStream: '' }; this.mensaje = ''; this.mostrarFormulario = true; }
  guardarCamara() {
    if (!this.obtenerZona(Number(this.nuevaCamara.zonaId))) { this.mensaje = 'Seleccione una zona válida.'; return; }
    try {
      this.camaraService.guardarCamara({ ...this.nuevaCamara, zonaId: Number(this.nuevaCamara.zonaId) }, this.camaraEditando?.id);
      this.cerrarFormulario();
    } catch (e) { this.mensaje = e instanceof Error ? e.message : 'Revise los datos.'; }
  }
  cambiarEstado(c: Camara) { this.camaraService.cambiarEstado(c.id); }
  cerrarFormulario() { this.mostrarFormulario = false; this.camaraEditando = null; this.nuevaCamara = formulario(); this.mensaje = ''; }
}
