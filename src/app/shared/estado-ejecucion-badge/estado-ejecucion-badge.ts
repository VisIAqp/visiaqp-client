import { Component, input } from '@angular/core';
import { EstadoProcesamiento } from '../../core/models/analisis.model';

export const estadosEjecucion = {
  pendiente: { etiqueta: 'Pendiente', clase: 'bg-warning-soft text-warning' },
  procesando: { etiqueta: 'En proceso', clase: 'bg-brand-soft text-brand' },
  completado: { etiqueta: 'Completado', clase: 'bg-success-soft text-success' },
  error: { etiqueta: 'Con error', clase: 'bg-danger-soft text-danger' },
} satisfies Record<EstadoProcesamiento, { etiqueta: string; clase: string }>;

@Component({
  selector: 'app-estado-ejecucion-badge',
  template: `
    <span class="inline-flex rounded-full px-2.5 py-1 text-caption font-semibold"
      [class]="estados[estado()].clase">{{ estados[estado()].etiqueta }}</span>
  `,
})
export class EstadoEjecucionBadge {
  readonly estado = input.required<EstadoProcesamiento>();
  readonly estados = estadosEjecucion;
}
