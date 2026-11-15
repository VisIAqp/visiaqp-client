import { Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IndicatorQuery } from '../../core/api/indicator-query';
import { ApiState } from '../api-state/api-state';

@Component({
  selector: 'app-filtros-indicadores',
  imports: [ApiState, FormsModule],
  templateUrl: './filtros-indicadores.html',
})
export class FiltrosIndicadores {
  readonly query = input.required<IndicatorQuery>();
}
