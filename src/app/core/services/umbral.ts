import { inject, Injectable } from '@angular/core';
import { catchError, of } from 'rxjs';
import { Api } from '../api/api';
export interface UmbralDto {
  id_zona: number;
  umbral_medio: number;
  umbral_alto: number;
}
@Injectable({ providedIn: 'root' })
export class UmbralService {
  private api = inject(Api);
  obtener(zonaId: number) {
    return this.api.get<UmbralDto>('/zonas/' + zonaId + '/umbral').pipe(
      catchError((e) => {
        if (
          e.status === 404 &&
          typeof e.error?.detail === 'string' &&
          e.error.detail.includes('no tiene umbral')
        )
          return of(null);
        throw e;
      }),
    );
  }
  guardar(zonaId: number, medio: number, alto: number) {
    return this.api.put<UmbralDto>('/zonas/' + zonaId + '/umbral', {
      umbral_medio: medio,
      umbral_alto: alto,
    });
  }
}
