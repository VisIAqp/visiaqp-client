import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { Api } from '../api/api';
import { DtoMapper, ZonaDto } from '../api/dto';
export interface ZonaInput {
  nombre: string;
  ubicacion: string | null;
  descripcion?: string | null;
  pais?: string;
  latitud?: number | null;
  longitud?: number | null;
  estado?: 'activa' | 'inactiva';
}
@Injectable({ providedIn: 'root' })
export class ZonaService {
  private api = inject(Api);
  private mapper = inject(DtoMapper);
  listar() {
    return this.api
      .get<ZonaDto[]>('/zonas')
      .pipe(map((rows) => rows.map((d) => this.mapper.zona(d))));
  }
  guardar(datos: ZonaInput, id?: number) {
    const req = id
      ? this.api.patch<ZonaDto>('/zonas/' + id, datos)
      : this.api.post<ZonaDto>('/zonas', datos);
    return req.pipe(map((d) => this.mapper.zona(d)));
  }
}
