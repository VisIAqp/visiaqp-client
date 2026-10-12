import { DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, Observable, Subscription } from 'rxjs';
import { errorMessage } from './api-error';

export class RequestState {
  readonly loading = signal(false);
  readonly error = signal('');
  private sequence = 0;
  private subscription?: Subscription;
  constructor(private readonly destroyRef: DestroyRef) {}
  run<T>(source: Observable<T>, success: (data: T) => void): void {
    const id = ++this.sequence;
    this.subscription?.unsubscribe();
    this.loading.set(true);
    this.error.set('');
    this.subscription = source
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if (id === this.sequence) this.loading.set(false);
        }),
      )
      .subscribe({
        next: success,
        error: (e) => {
          if (id === this.sequence) this.error.set(errorMessage(e));
        },
      });
  }
}
