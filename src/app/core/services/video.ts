import { inject, Injectable } from '@angular/core';
import { Api } from '../api/api';
import { VideoDto } from '../api/dto';
@Injectable({ providedIn: 'root' })
export class VideoService {
  private api = inject(Api);
  listar() {
    return this.api.get<VideoDto[]>('/videos', { solo_disponibles: true });
  }
}
