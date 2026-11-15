import { computed, DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, Observable, Subscription } from 'rxjs';
import { errorMessage } from './api-error';

export class RequestState {
  readonly loading = signal(false);
  readonly error = signal('');
  readonly actualizado = signal<Date | null>(null);
  readonly cargaInicial = computed(() => this.loading() && !this.actualizado() && !this.error());
  private sequence = 0;
  private subscription?: Subscription;
  constructor(
    private readonly destroyRef: DestroyRef,
    private readonly conservarErrorAlRefrescar = false,
  ) {}
  cancel(): void {
    ++this.sequence;
    this.subscription?.unsubscribe();
    this.subscription = undefined;
    this.loading.set(false);
  }
  reiniciar(): void {
    this.cancel();
    this.actualizado.set(null);
    this.error.set('');
  }
  run<T>(source: Observable<T>, success: (data: T) => void): void {
    const id = ++this.sequence;
    this.subscription?.unsubscribe();
    this.loading.set(true);
    if (!this.conservarErrorAlRefrescar) this.error.set('');
    this.subscription = source
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if (id === this.sequence) this.loading.set(false);
        }),
      )
      .subscribe({
        next: (data) => {
          if (id !== this.sequence) return;
          this.error.set('');
          this.actualizado.set(new Date());
          success(data);
        },
        error: (e) => {
          if (id === this.sequence) this.error.set(errorMessage(e));
        },
      });
  }
}
