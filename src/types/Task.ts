import { Project } from './Project';

export interface Task {
  id?: number;
  proyecto: Project;
  nombre: string;
  descripcion: string;
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA';
  estado: 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA';
  deadline?: string;
  fechaCreacion?: string;
  fechaActualizacion?: string;
  subtareas?: Task[]; 
  tareaPadre?: Task;
}