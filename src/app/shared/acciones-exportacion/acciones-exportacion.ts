import { DecimalPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-acciones-exportacion',
  imports: [DecimalPipe],
  templateUrl: './acciones-exportacion.html',
})
export class AccionesExportacion {
  readonly total = input.required<number>();
  readonly habilitada = input.required<boolean>();
  readonly descargarCsv = output<void>();
  readonly imprimir = output<void>();
}
