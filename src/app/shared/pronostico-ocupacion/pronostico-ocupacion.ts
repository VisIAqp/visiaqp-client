import { DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { mostrarFecha } from '../../core/api/metricas-presentacion';
import { PronosticoOcupacion as DatosPronostico } from '../../core/models/pronostico.model';

@Component({
  selector: 'app-pronostico-ocupacion',
  imports: [DecimalPipe, RouterLink],
  templateUrl: './pronostico-ocupacion.html',
})
export class PronosticoOcupacion {
  readonly datos = input.required<DatosPronostico>();
  readonly breve = input(false);
  readonly fecha = mostrarFecha;
  readonly motivo = {
    disponible: '',
    camara_no_apta: 'Disponible para cámaras fijas y activas con área configurada.',
    sin_modelo: 'Aún no hay un modelo entrenado para esta cámara.',
    sin_pronostico_vigente: 'No hay estimaciones vigentes para esta cámara.',
  };
}
