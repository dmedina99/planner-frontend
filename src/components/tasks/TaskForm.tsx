import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { Task, Project } from '../../types';
import { projectApi } from '../../services/api';

interface TaskFormProps {
  show: boolean;
  onHide: () => void;
  onSave: (task: Omit<Task, 'id' | 'proyecto' | 'fechaCreacion' | 'fechaActualizacion'>, proyectoId: number) => void;
  task?: Task;
}

const TaskForm: React.FC<TaskFormProps> = ({ show, onHide, onSave, task }) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [prioridad, setPrioridad] = useState<Task['prioridad']>('MEDIA');
  const [estado, setEstado] = useState<Task['estado']>('PENDIENTE');
  const [deadline, setDeadline] = useState('');
  const [proyectoId, setProyectoId] = useState<number>(0);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Cargar proyectos al abrir el modal
  useEffect(() => {
    if (show) {
      loadProjects();
    }
    // eslint-disable-next-line 
  }, [show]);

  // Cargar datos de la tarea si estamos editando
  useEffect(() => {
    if (task) {
      setNombre(task.nombre);
      setDescripcion(task.descripcion);
      setPrioridad(task.prioridad);
      setEstado(task.estado);
      setDeadline(task.deadline || '');
      setProyectoId(task.proyecto.id || 0);
    } else {
      // Resetear formulario
      setNombre('');
      setDescripcion('');
      setPrioridad('MEDIA');
      setEstado('PENDIENTE');
      setDeadline('');
      setProyectoId(0);
    }
  }, [task, show]);

  const loadProjects = async () => {
    try {
      setLoadingProjects(true);
      const response = await projectApi.getByEstado('ACTIVO');
      setProjects(response.data);
      
      // Si no hay proyecto seleccionado y hay proyectos, seleccionar el primero
      if (!task && response.data.length > 0) {
        setProyectoId(response.data[0].id || 0);
      }
    } catch (error) {
      console.error('Error al cargar proyectos', error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (proyectoId === 0) {
      alert('Por favor selecciona un proyecto');
      return;
    }

    onSave({
      nombre,
      descripcion,
      prioridad,
      estado,
      deadline: deadline || undefined
    }, proyectoId);

    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{task ? 'Editar Tarea' : 'Nueva Tarea'}</Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {loadingProjects ? (
            <div className="text-center py-3">
              <Spinner animation="border" size="sm" /> Cargando proyectos...
            </div>
          ) : (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Proyecto *</Form.Label>
                <Form.Select
                  value={proyectoId}
                  onChange={(e) => setProyectoId(Number(e.target.value))}
                  required
                  disabled={!!task} // No permitir cambiar proyecto al editar
                >
                  <option value={0}>Selecciona un proyecto</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.nombre}
                    </option>
                  ))}
                </Form.Select>
                {task && (
                  <Form.Text className="text-muted">
                    No se puede cambiar el proyecto de una tarea existente
                  </Form.Text>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Nombre de la Tarea *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ej: Diseñar mockups de la homepage"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Describe la tarea..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Prioridad *</Form.Label>
                <Form.Select
                  value={prioridad}
                  onChange={(e) => setPrioridad(e.target.value as Task['prioridad'])}
                  required
                >
                  <option value="BAJA">Baja</option>
                  <option value="MEDIA">Media</option>
                  <option value="ALTA">Alta</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Estado *</Form.Label>
                <Form.Select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value as Task['estado'])}
                  required
                >
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="EN_PROGRESO">En Progreso</option>
                  <option value="COMPLETADA">Completada</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Fecha límite (Deadline)</Form.Label>
                <Form.Control
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
                <Form.Text className="text-muted">
                  Opcional. Fecha en la que debe completarse la tarea
                </Form.Text>
              </Form.Group>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={loadingProjects}>
            {task ? 'Guardar Cambios' : 'Crear Tarea'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default TaskForm;