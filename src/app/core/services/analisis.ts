import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { Api } from '../api/api';
import { DtoMapper, ProcesamientoDto } from '../api/dto';
import { EstadoProcesamiento } from '../models/analisis.model';
@Injectable({ providedIn: 'root' })
export class AnalisisService {
  private api = inject(Api);
  private mapper = inject(DtoMapper);
  listar(estado?: EstadoProcesamiento, camaraId?: number) {
    return this.api
      .get<ProcesamientoDto[]>('/procesamientos', { estado, id_camara: camaraId, limite: 500 })
      .pipe(map((rows) => rows.map((d) => this.mapper.procesamiento(d))));
  }
  solicitar(videoId: number, camaraId: number, fecha: string) {
    return this.api
      .post<ProcesamientoDto>('/procesamientos/solicitar', {
        id_video: videoId,
        id_camara: camaraId,
        fecha_captura_inicio: fecha,
      })
      .pipe(map((d) => this.mapper.procesamiento(d)));
  }
  cancelar(id: number) {
    return this.api.patch<{ id_procesamiento: number; estado: string }>(
      '/procesamientos/' + id + '/cancelar',
      {},
    );
  }
}
