import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IndicatorQuery } from '../../core/api/indicator-query';
import { estadoMedicion } from '../../core/api/metricas-presentacion';
import { Pagination } from '../pagination/pagination';
@Component({
  selector: 'app-indicator-view',
  imports: [CommonModule, Pagination],
  templateUrl: './indicator-view.html',
})
export class IndicatorView {
  readonly query = input.required<IndicatorQuery>();
  readonly printAll = input(false);
  readonly verConteos = signal(false);
  readonly estadoMedicion = estadoMedicion;
}
