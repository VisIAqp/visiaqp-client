import { Component, computed, input } from '@angular/core';

const estilos = {
  disponible: 'bg-success-soft text-success',
  advertencia: 'bg-warning-soft text-warning',
  error: 'bg-danger-soft text-danger',
  neutro: 'bg-canvas text-muted',
};

const estados: Record<string, { texto: string; clase: string }> = {
  conectando: { texto: 'Conectando', clase: estilos.advertencia },
  reportando: { texto: 'Recibiendo imágenes', clase: estilos.disponible },
  sin_senal: { texto: 'Sin señal', clase: estilos.error },
  sin_actividad: { texto: 'Sin actividad del motor', clase: estilos.advertencia },
  interrumpida: { texto: 'Interrumpida', clase: estilos.error },
  sin_transmision: { texto: 'Sin transmisión', clase: estilos.neutro },
  finalizada: { texto: 'Finalizada', clase: estilos.neutro },
  deshabilitada: { texto: 'Deshabilitada', clase: estilos.neutro },
};

@Component({
  selector: 'app-estado-camara-badge',
  template: `
    <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-label font-medium"
      [class]="presentacion().clase">
      <span class="size-1.5 shrink-0 rounded-full bg-current" aria-hidden="true"></span>
      {{ presentacion().texto }}
    </span>
  `,
})
export class EstadoCamaraBadge {
  readonly estado = input<string>();
  readonly faltaArea = input(false);
  readonly cargando = input(false);

  readonly presentacion = computed(() => {
    if (this.faltaArea()) return { texto: 'Área sin configurar', clase: estilos.advertencia };
    return estados[this.estado() ?? ''] ?? {
      texto: this.cargando() ? 'Consultando estado' : 'Estado no disponible',
      clase: estilos.neutro,
    };
  });
}
