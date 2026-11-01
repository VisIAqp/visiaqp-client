import { DestroyRef } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginaMetricas } from '../models/metricas.model';
import { RequestState } from './request-state';

export class PanelMetricas<T> {
  readonly estado: RequestState;
  pagina: PaginaMetricas<T> | null = null;
  private consulta?: Observable<PaginaMetricas<T>>;
  private cambiar = () => {};
  constructor(ref: DestroyRef) { this.estado = new RequestState(ref); }
  get filas() { return this.pagina?.datos ?? []; }
  get numeroPagina() { return this.pagina ? Math.floor(this.pagina.desplazamiento / this.pagina.limite) + 1 : 1; }
  get paginas() { return this.pagina ? Math.max(1, Math.ceil(this.pagina.total / this.pagina.limite)) : 1; }
  limpiar() {
    this.estado.cancel();
    this.estado.error.set('');
    this.pagina = null;
    this.consulta = undefined;
    this.cambiar = () => {};
  }
  reintentar() { if (this.consulta) this.cargar(this.consulta, this.cambiar); }
  cargar(consulta: Observable<PaginaMetricas<T>>, cambiar = () => {}) {
    this.consulta = consulta;
    this.cambiar = cambiar;
    this.pagina = null;
    cambiar();
    this.estado.run(consulta, (pagina) => { this.pagina = pagina; cambiar(); });
  }
  desplazamiento(delta: number) {
    return this.pagina ? Math.max(0, this.pagina.desplazamiento + delta * this.pagina.limite) : 0;
  }
}
