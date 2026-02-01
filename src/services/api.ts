import axios from 'axios';
import { Project, Task, TimeRecord } from '../types';

const API_URL = 'http://localhost:8081/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== PROYECTOS ====================

export const projectApi = {
  getAll: () => api.get<Project[]>('/proyectos'),
  
  getById: (id: number) => api.get<Project>(`/proyectos/${id}`),
  
  create: (project: Omit<Project, 'id' | 'fechaCreacion' | 'fechaActualizacion'>) => 
    api.post<Project>('/proyectos', project),
  
  update: (id: number, project: Partial<Project>) => 
    api.put<Project>(`/proyectos/${id}`, project),
  
  delete: (id: number) => api.delete(`/proyectos/${id}`),
  
  toggleArchivar: (id: number) => 
    api.patch<Project>(`/proyectos/${id}/archivar`),
  
  getByEstado: (estado: 'ACTIVO' | 'ARCHIVADO') => 
    api.get<Project[]>(`/proyectos/estado/${estado}`),
  
  search: (nombre: string) => 
    api.get<Project[]>(`/proyectos/buscar/${nombre}`),
};

// ==================== TAREAS ====================

export const taskApi = {
  getAll: () => api.get<Task[]>('/tareas'),
  
  getById: (id: number) => api.get<Task>(`/tareas/${id}`),
  
  getByProyecto: (proyectoId: number) => 
    api.get<Task[]>(`/tareas/proyecto/${proyectoId}`),
  
  create: (proyectoId: number, task: Omit<Task, 'id' | 'proyecto' | 'fechaCreacion' | 'fechaActualizacion'>) => 
    api.post<Task>(`/tareas/proyecto/${proyectoId}`, task),
  
  update: (id: number, task: Partial<Task>) => 
    api.put<Task>(`/tareas/${id}`, task),
  
  delete: (id: number) => api.delete(`/tareas/${id}`),
  
  changeEstado: (id: number, estado: 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA') => 
    api.patch<Task>(`/tareas/${id}/estado`, { estado }),
  
  search: (nombre: string) => 
    api.get<Task[]>(`/tareas/buscar/${nombre}`),
};

// ==================== REGISTROS DE TIEMPO ====================

export const timeRecordApi = {
  getAll: () => api.get<TimeRecord[]>('/tiempo'),
  
  getById: (id: number) => api.get<TimeRecord>(`/tiempo/${id}`),
  
  getByTarea: (tareaId: number) => 
    api.get<TimeRecord[]>(`/tiempo/tarea/${tareaId}`),
  
  create: (tareaId: number, timeRecord: Omit<TimeRecord, 'id' | 'tarea' | 'fechaCreacion'>) => 
    api.post<TimeRecord>(`/tiempo/tarea/${tareaId}`, timeRecord),
  
  update: (id: number, timeRecord: Partial<TimeRecord>) => 
    api.put<TimeRecord>(`/tiempo/${id}`, timeRecord),
  
  delete: (id: number) => api.delete(`/tiempo/${id}`),
  
  getTotalByTarea: (tareaId: number) => 
    api.get<{ tareaId: number; totalMinutos: number; totalHoras: number; minutosPendientes: number }>(`/tiempo/tarea/${tareaId}/total`),
  
  getTotalByProyecto: (proyectoId: number, fechaInicio: string, fechaFin: string) => 
    api.get(`/tiempo/proyecto/${proyectoId}/total`, {
      params: { inicio: fechaInicio, fin: fechaFin }
    }),
};

export default api;