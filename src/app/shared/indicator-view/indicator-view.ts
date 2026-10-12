import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IndicatorQuery } from '../../core/api/indicator-query';
import { ApiState } from '../api-state/api-state';
import { Pagination } from '../pagination/pagination';
@Component({
  selector: 'app-indicator-view',
  imports: [CommonModule, FormsModule, ApiState, Pagination],
  templateUrl: './indicator-view.html',
})
export class IndicatorView {
  readonly query = input.required<IndicatorQuery>();
  readonly printAll = input(false);
}
