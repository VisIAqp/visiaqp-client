import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.html',
})
export class Pagination {
  readonly unit = input('ventanas');
  readonly page = input.required<number>();
  readonly pages = input.required<number>();
  readonly total = input.required<number>();
  readonly pageChange = output<number>();
}
