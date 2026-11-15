import { Component, input, model } from '@angular/core';

@Component({
  selector: 'app-busqueda-catalogo',
  template: `
    <label class="grid min-w-0 gap-1">
      {{ etiqueta() }}
      <input type="search" class="ui-field w-full" [value]="texto()" (input)="actualizar($event)" />
    </label>
  `,
})
export class BusquedaCatalogo {
  readonly etiqueta = input.required<string>();
  readonly texto = model('');

  actualizar(evento: Event) {
    this.texto.set((evento.target as HTMLInputElement).value);
  }
}
