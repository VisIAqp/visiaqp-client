import { Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { rangoValido } from '../../../core/api/metricas-presentacion';
import { Camara } from '../../../core/models/camara.model';
import { FiltrosMetricas } from '../../../core/models/metricas.model';
import { Zona } from '../../../core/models/zona.model';

export type VistaOcupacion = 'historico' | 'reciente';
export type AgrupacionOcupacion = 'camara' | 'zona';
export type FuenteOcupacion = '' | NonNullable<FiltrosMetricas['tipo_fuente']>;
export interface OpcionesOcupacion {
  desde: string;
  hasta: string;
  periodo: FiltrosMetricas['periodo'];
  fuente: FuenteOcupacion;
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

  readonly abierto = signal(false);
  readonly error = signal('');
  readonly agrupaciones: ReadonlyArray<{ valor: AgrupacionOcupacion; nombre: string }> = [
    { valor: 'camara', nombre: 'Por cámara' }, { valor: 'zona', nombre: 'Por zona' },
  ];
  readonly vistas: ReadonlyArray<{ valor: VistaOcupacion; nombre: string }> = [
    { valor: 'historico', nombre: 'Histórico' }, { valor: 'reciente', nombre: 'Últimos 60 min' },
  ];
  readonly fuentes: ReadonlyArray<{ valor: FuenteOcupacion; nombre: string }> = [
    { valor: '', nombre: 'Todas las fuentes' }, { valor: 'stream', nombre: 'Transmisiones' },
    { valor: 'video', nombre: 'Videos' }, { valor: 'imagen', nombre: 'Imágenes' },
  ];
  readonly camarasDisponibles = computed(() => this.camaras().filter((camara) =>
    this.zona() === 0 || camara.zonaId === this.zona(),
  ));
  readonly etiquetaFuente = computed(() => {
    const fuente = this.opciones().fuente;
    return fuente ? this.fuentes.find((item) => item.valor === fuente)?.nombre : '';
  });
  borrador: OpcionesOcupacion = { desde: '', hasta: '', periodo: 'hora', fuente: '' };

  alternar() {
    if (this.abierto()) {
      this.abierto.set(false);
      return;
    }
    this.borrador = { ...this.opciones() };
    this.error.set('');
    this.abierto.set(true);
  }

  seleccionarVista(vista: VistaOcupacion) {
    if (vista === this.vista()) return;
    this.abierto.set(false);
    this.vistaChange.emit(vista);
  }

  aplicarOpciones(boton: HTMLButtonElement) {
    if (this.vista() === 'historico' && !rangoValido(this.borrador.desde, this.borrador.hasta)) {
      this.error.set('Elige un rango válido de hasta 31 días, incluyendo ambas fechas.');
      return;
    }
    this.aplicar.emit({ ...this.borrador });
    this.cerrar(boton);
  }

  cerrar(boton: HTMLButtonElement) {
    this.abierto.set(false);
    boton.focus();
  }
}
