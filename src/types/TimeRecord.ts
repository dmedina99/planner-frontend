import { Task } from './Task';

export interface TimeRecord {
  id?: number;
  tarea: Task;
  tiempoDedicado: number;
  fecha: string;
  notas?: string;
  fechaCreacion?: string;
}