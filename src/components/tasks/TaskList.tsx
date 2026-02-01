import React, { useEffect, useState } from 'react';
import { Card, Button, Badge, Row, Col, Spinner, Alert, Form } from 'react-bootstrap';
import { FaEdit, FaTrash, FaClock } from 'react-icons/fa';
import { IconBaseProps } from 'react-icons';
import { Task, Project } from '../../types';
import { taskApi, projectApi } from '../../services/api';
import SubtaskList from './SubtaskList';

interface TaskListProps {
  onEdit: (task: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({ onEdit }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedEstado, setSelectedEstado] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksResponse, projectsResponse] = await Promise.all([
        taskApi.getAll(),
        projectApi.getAll()
      ]);
      setTasks(tasksResponse.data);
      setProjects(projectsResponse.data);
      setError('');
    } catch (err) {
      setError('Error al cargar las tareas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar esta tarea?')) {
      try {
        await taskApi.delete(id);
        loadData();
      } catch (err) {
        alert('Error al eliminar la tarea');
      }
    }
  };

  const handleChangeEstado = async (id: number, nuevoEstado: Task['estado']) => {
    try {
      await taskApi.changeEstado(id, nuevoEstado);
      loadData();
    } catch (err) {
      alert('Error al cambiar el estado');
    }
  };

  // Filtrar tareas
  const filteredTasks = tasks.filter(task => !task.tareaPadre).filter(task => {
    const projectMatch = selectedProject === 'all' || task.proyecto.id?.toString() === selectedProject;
    const estadoMatch = selectedEstado === 'all' || task.estado === selectedEstado;
    return projectMatch && estadoMatch;
  });

  // Función para obtener el color del badge según prioridad
  const getPrioridadColor = (prioridad: Task['prioridad']) => {
    switch (prioridad) {
      case 'ALTA': return 'danger';
      case 'MEDIA': return 'warning';
      case 'BAJA': return 'info';
    }
  };

  // Función para obtener el color del badge según estado
  const getEstadoColor = (estado: Task['estado']) => {
    switch (estado) {
      case 'PENDIENTE': return 'secondary';
      case 'EN_PROGRESO': return 'primary';
      case 'COMPLETADA': return 'success';
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Cargando tareas...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <>
      {/* Filtros */}
      <Row className="mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Filtrar por Proyecto</Form.Label>
            <Form.Select 
              value={selectedProject} 
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              <option value="all">Todos los proyectos</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.nombre}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Filtrar por Estado</Form.Label>
            <Form.Select 
              value={selectedEstado} 
              onChange={(e) => setSelectedEstado(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="EN_PROGRESO">En Progreso</option>
              <option value="COMPLETADA">Completada</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {filteredTasks.length === 0 ? (
        <Alert variant="info">
          No hay tareas que coincidan con los filtros. ¡Crea tu primera tarea!
        </Alert>
      ) : (
        <Row>
          {filteredTasks.map((task) => (
            <Col md={6} lg={4} key={task.id} className="mb-3">
              <Card>
                <Card.Header>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <strong>{task.nombre}</strong>
                      <div className="small text-muted">{task.proyecto.nombre}</div>
                    </div>
                    <div className="d-flex gap-1 flex-column">
                      <Badge bg={getPrioridadColor(task.prioridad)}>
                        {task.prioridad}
                      </Badge>
                      <Badge bg={getEstadoColor(task.estado)}>
                        {task.estado.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </Card.Header>
                <Card.Body>
                  <Card.Text className="small">{task.descripcion || 'Sin descripción'}</Card.Text>
                  
                  {task.deadline && (
                    <div className="small text-muted mb-2">
                      {(FaClock as React.FC<IconBaseProps>)({ className: 'me-1' })}
                      Vence: {new Date(task.deadline).toLocaleDateString()}
                    </div>
                  )}

                  {/* Cambiar estado rápido */}
                  <Form.Group className="mb-2">
                    <Form.Label className="small">Cambiar estado:</Form.Label>
                    <Form.Select 
                      size="sm"
                      value={task.estado}
                      onChange={(e) => task.id && handleChangeEstado(task.id, e.target.value as Task['estado'])}
                    >
                      <option value="PENDIENTE">Pendiente</option>
                      <option value="EN_PROGRESO">En Progreso</option>
                      <option value="COMPLETADA">Completada</option>
                    </Form.Select>
                  </Form.Group>

                  <div className="d-flex gap-2">
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => onEdit(task)}
                    >
                      {(FaEdit as React.FC<IconBaseProps>)({ className: 'me-1' })} Editar
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => task.id && handleDelete(task.id)}
                    >
                      {(FaTrash as React.FC<IconBaseProps>)({ className: 'me-1' })} Eliminar
                    </Button>
                  </div>
                </Card.Body>
                {/* Subtareas */}
                <SubtaskList task={task} onUpdate={loadData} />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </>
  );
};

export default TaskList;