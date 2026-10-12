export interface Zona {
  id: number;
  nombre: string;
  descripcion: string | null;
  ubicacion: string | null;
  pais: string;
  latitud: number | null;
  longitud: number | null;
  estado: 'activa' | 'inactiva';
}
