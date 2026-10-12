import { Injectable } from '@angular/core';
import { indicadoresDemo } from '../data/demo';
// Fixtures preparados con los conteos de prueba; los agregados reales vendrán del backend.
@Injectable({ providedIn: 'root' })
export class IndicadorService {
  obtenerIndicadores() { return indicadoresDemo; }
}
