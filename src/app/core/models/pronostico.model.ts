export interface EstimacionOcupacion {
  horizonte_min: 15 | 30;
  objetivo_en: string;
  promedio_presentes: number;
  metodo: 'regresion_ridge' | 'persistencia';
}

export interface PronosticoOcupacion {
  id_camara: number;
  estado: 'disponible' | 'camara_no_apta' | 'sin_modelo' | 'sin_pronostico_vigente';
  base_en: string | null;
  emitido_en: string | null;
  version_modelo: string | null;
  estimaciones: EstimacionOcupacion[];
}
