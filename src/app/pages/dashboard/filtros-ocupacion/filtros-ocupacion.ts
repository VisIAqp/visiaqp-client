import { Component, computed, input, linkedSignal, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { rangoValido } from '../../../core/api/metricas-presentacion';
import { Camara } from '../../../core/models/camara.model';
import { FiltrosMetricas } from '../../../core/models/metricas.model';
import { Zona } from '../../../core/models/zona.model';

export type VistaOcupacion = 'historico' | 'reciente';
export type AgrupacionOcupacion = 'camara' | 'zona';
export interface OpcionesOcupacion {
  desde: string;
  hasta: string;
  periodo: FiltrosMetricas['periodo'];
}

@Component({
  selector: 'app-filtros-ocupacion',
  imports: [FormsModule],
  templateUrl: './filtros-ocupacion.html',
})
export class FiltrosOcupacion {
  readonly zonas = input.required<readonly Zona[]>();
  readonly camaras = input.required<readonly Camara[]>();
  readonly zona = input.required<number>();
  readonly camara = input.required<number>();
  readonly vista = input.required<VistaOcupacion>();
  readonly agrupacion = input.required<AgrupacionOcupacion>();
  readonly opciones = input.required<OpcionesOcupacion>();
  readonly zonaChange = output<number>();
  readonly camaraChange = output<number>();
  readonly vistaChange = output<VistaOcupacion>();
  readonly agrupacionChange = output<AgrupacionOcupacion>();
  readonly aplicar = output<OpcionesOcupacion>();

  readonly error = signal('');
  readonly agrupaciones: ReadonlyArray<{ valor: AgrupacionOcupacion; nombre: string }> = [
    { valor: 'camara', nombre: 'Por cámara' }, { valor: 'zona', nombre: 'Por zona' },
  ];
  readonly vistas: ReadonlyArray<{ valor: VistaOcupacion; nombre: string }> = [
    { valor: 'historico', nombre: 'Histórico' }, { valor: 'reciente', nombre: 'Últimos 60 min' },
  ];
  readonly camarasDisponibles = computed(() => this.camaras().filter((camara) =>
    this.zona() === 0 || camara.zonaId === this.zona(),
  ));
  readonly borrador = linkedSignal(() => this.opciones());
  readonly pendiente = computed(() => {
    const aplicado = this.opciones();
    const borrador = this.borrador();
    return aplicado.desde !== borrador.desde || aplicado.hasta !== borrador.hasta || aplicado.periodo !== borrador.periodo;
  });

  editar<K extends keyof OpcionesOcupacion>(campo: K, valor: OpcionesOcupacion[K]) {
    this.borrador.update((filtros) => ({ ...filtros, [campo]: valor }));
    this.error.set('');
  }

  aplicarOpciones() {
    if (!this.pendiente()) return;
    const borrador = this.borrador();
    if (!rangoValido(borrador.desde, borrador.hasta)) {
      this.error.set('Elige un rango válido de hasta 31 días.');
      return;
    }
    this.aplicar.emit(borrador);
  }
}
