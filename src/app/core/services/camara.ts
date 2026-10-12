import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { Api } from '../api/api';
import { DtoMapper, CamaraDto } from '../api/dto';
import { ConfiguracionCamara, EstadoCamara } from '../models/camara.model';
@Injectable({ providedIn: 'root' })
export class CamaraService {
  private api = inject(Api);
  private mapper = inject(DtoMapper);
  listar() {
    return this.api
      .get<CamaraDto[]>('/admin/camaras')
      .pipe(map((rows) => rows.map((d) => this.mapper.camara(d))));
  }
  guardar(config: ConfiguracionCamara, id?: number) {
    const body = {
      nombre: config.nombre.trim(),
      tipo: config.tipo,
      estado: config.estado,
      intervalo_muestreo_seg: config.intervaloMuestreoSeg,
      zone_polygon: config.zonePolygon,
      ...(!id ? { id_zona: config.zonaId } : {}),
      ...(!id || config.urlStream.trim() ? { url_stream: config.urlStream.trim() } : {}),
    };
    return (
      id
        ? this.api.patch<CamaraDto>('/admin/camaras/' + id, body)
        : this.api.post<CamaraDto>('/admin/camaras', body)
    ).pipe(map((d) => this.mapper.camara(d)));
  }
  cambiarEstado(id: number, estado: EstadoCamara) {
    return this.api
      .patch<CamaraDto>('/admin/camaras/' + id, { estado })
      .pipe(map((d) => this.mapper.camara(d)));
  }
}
