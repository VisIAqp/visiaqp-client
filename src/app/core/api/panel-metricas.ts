import { DestroyRef, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginaMetricas } from '../models/metricas.model';
import { RequestState } from './request-state';

export class PanelMetricas<T> {
  readonly estado: RequestState;
  private readonly datos = signal<PaginaMetricas<T> | null>(null);
  private consulta?: Observable<PaginaMetricas<T>>;
  private cambiar = () => {};
  constructor(ref: DestroyRef, private readonly conservarPagina = false) {
    this.estado = new RequestState(ref, conservarPagina);
  }
  get pagina() { return this.datos(); }
  get filas() { return this.pagina?.datos ?? []; }
  get numeroPagina() { return this.pagina ? Math.floor(this.pagina.desplazamiento / this.pagina.limite) + 1 : 1; }
  get paginas() { return this.pagina ? Math.max(1, Math.ceil(this.pagina.total / this.pagina.limite)) : 1; }
  limpiar() {
    this.estado.reiniciar();
    this.datos.set(null);
    this.consulta = undefined;
    this.cambiar = () => {};
  }
  reintentar() { if (this.consulta) this.cargar(this.consulta, this.cambiar); }
  refrescar() { if (!this.estado.loading()) this.reintentar(); }
  cargar(consulta: Observable<PaginaMetricas<T>>, cambiar = () => {}) {
    this.consulta = consulta;
    this.cambiar = cambiar;
    if (!this.conservarPagina) {
      this.datos.set(null);
      cambiar();
    }
    this.estado.run(consulta, (pagina) => { this.datos.set(pagina); cambiar(); });
  }
  desplazamiento(delta: number) {
    return this.pagina ? Math.max(0, this.pagina.desplazamiento + delta * this.pagina.limite) : 0;
  }
}
