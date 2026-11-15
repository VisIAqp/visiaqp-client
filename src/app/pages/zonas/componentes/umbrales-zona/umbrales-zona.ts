import { Component, DestroyRef, effect, inject, input, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RequestState } from '../../../../core/api/request-state';
import { Auth } from '../../../../core/auth/auth';
import { UmbralService } from '../../../../core/services/umbral';
import { ApiState } from '../../../../shared/api-state/api-state';

@Component({
  selector: 'app-umbrales-zona',
  imports: [ApiState, FormsModule],
  templateUrl: './umbrales-zona.html',
})
export class UmbralesZona {
  private readonly api = inject(UmbralService);
  private readonly auth = inject(Auth);
  private readonly ref = inject(DestroyRef);
  readonly zonaId = input.required<number>();
  readonly editable = input(false);
  readonly consulta = new RequestState(this.ref);
  readonly guardado = new RequestState(this.ref);
  readonly predeterminado = signal(false);
  readonly confirmacion = signal(false);
  medio: number | null = null;
  alto: number | null = null;

  constructor() {
    effect(() => {
      const id = this.zonaId();
      untracked(() => {
        this.consulta.reiniciar();
        this.guardado.reiniciar();
        this.confirmacion.set(false);
        this.cargar(id);
      });
    });
  }

  cargar(id = this.zonaId()) {
    if (this.consulta.loading()) return;
    this.consulta.run(this.api.obtener(id), (umbral) => {
      this.medio = umbral?.umbral_medio ?? 10;
      this.alto = umbral?.umbral_alto ?? 30;
      this.predeterminado.set(umbral === null);
    });
  }

  guardar() {
    if (!this.editable() || !this.auth.isAdmin() || this.guardado.loading() || !this.consulta.actualizado()) return;
    this.confirmacion.set(false);
    const { medio, alto } = this;
    if (medio === null || alto === null || !Number.isInteger(medio) || !Number.isInteger(alto)
      || medio < 0 || alto <= medio) {
      this.guardado.error.set('Usa números enteros. El umbral alto debe ser mayor que el medio.');
      return;
    }
    this.guardado.run(this.api.guardar(this.zonaId(), medio, alto), (umbral) => {
      this.medio = umbral.umbral_medio;
      this.alto = umbral.umbral_alto;
      this.predeterminado.set(false);
      this.confirmacion.set(true);
    });
  }
}
