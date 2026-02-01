export interface Project {
  id?: number;
  nombre: string;
  descripcion: string;
  color: string;
  estado: 'ACTIVO' | 'ARCHIVADO';
  fechaCreacion?: string;
  fechaActualizacion?: string;
}