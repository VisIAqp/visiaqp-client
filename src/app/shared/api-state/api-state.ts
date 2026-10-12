import { Component, input, output } from '@angular/core';
@Component({
  selector: 'app-api-state',
  template: `@if (loading()) {
      <p class="text-label text-muted" role="status">Cargando datos…</p>
    }
    @if (error()) {
      <div
        class="my-4 rounded-lg border border-solid border-danger bg-danger-soft p-4"
        role="alert"
      >
        <p class="mt-0 mb-3 text-danger">{{ error() }}</p>
        @if (retryable()) {
          <button
            type="button"
            class="ui-focus cursor-pointer rounded-lg border border-solid border-field bg-white px-4 py-2"
            (click)="retry.emit()"
          >
            Reintentar
          </button>
        }
      </div>
    }`,
})
export class ApiState {
  readonly loading = input(false);
  readonly error = input('');
  readonly retryable = input(true);
  readonly retry = output<void>();
}
