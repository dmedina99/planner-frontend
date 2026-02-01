import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Card, ListGroup, Badge, Button, InputGroup } from 'react-bootstrap';
import { FaSearch, FaProjectDiagram, FaTasks, FaEdit } from 'react-icons/fa';
import { IconBaseProps } from 'react-icons';
import { Project, Task } from '../types';
import { projectApi, taskApi } from '../services/api';
import { useNavigate } from 'react-router-dom';

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados
  const [searchTerm, setSearchTerm] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  
  // Filtros
  const [filterProyecto, setFilterProyecto] = useState<string>('all');
  const [filterEstado, setFilterEstado] = useState<string>('all');
  const [filterPrioridad, setFilterPrioridad] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterProyecto, filterEstado, filterPrioridad, allProjects, allTasks]);

  const loadData = async () => {
    try {
      const [projectsRes, tasksRes] = await Promise.all([
        projectApi.getAll(),
        taskApi.getAll()
      ]);
      setAllProjects(projectsRes.data);
      setAllTasks(tasksRes.data);
    } catch (error) {
      console.error('Error al cargar datos', error);
    }
  };

  const applyFilters = () => {
    // Filtrar proyectos
    let filteredProjects = allProjects.filter(project =>
      project.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.descripcion && project.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Filtrar tareas
    let filteredTasks = allTasks.filter(task =>
      task.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.descripcion && task.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Filtro por proyecto
    if (filterProyecto !== 'all') {
      filteredTasks = filteredTasks.filter(task => 
        task.proyecto.id?.toString() === filterProyecto
      );
    }

    // Filtro por estado
    if (filterEstado !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.estado === filterEstado);
    }

    // Filtro por prioridad
    if (filterPrioridad !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.prioridad === filterPrioridad);
    }

    setProjects(filteredProjects);
    setTasks(filteredTasks);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterProyecto('all');
    setFilterEstado('all');
    setFilterPrioridad('all');
  };

  const getPrioridadBadge = (prioridad: Task['prioridad']) => {
    const colors = { ALTA: 'danger', MEDIA: 'warning', BAJA: 'info' };
    return <Badge bg={colors[prioridad]}>{prioridad}</Badge>;
  };

  const getEstadoBadge = (estado: Task['estado']) => {
    const colors = { PENDIENTE: 'secondary', EN_PROGRESO: 'primary', COMPLETADA: 'success' };
    return <Badge bg={colors[estado]}>{estado.replace('_', ' ')}</Badge>;
  };

  const totalResultados = projects.length + tasks.length;

  return (
    <Container>
      <h1 className="mb-4">🔍 Búsqueda Avanzada</h1>

      {/* Barra de búsqueda */}
      <Card className="mb-4">
        <Card.Body>
          <InputGroup size="lg" className="mb-3">
            {(FaSearch as React.FC<IconBaseProps>)({ 
              style: { position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, color: '#6c757d' }
            })}
            <Form.Control
              type="text"
              placeholder="Buscar proyectos o tareas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '45px' }}
            />
          </InputGroup>

          {/* Filtros */}
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Proyecto</Form.Label>
                <Form.Select 
                  value={filterProyecto}
                  onChange={(e) => setFilterProyecto(e.target.value)}
                >
                  <option value="all">Todos los proyectos</option>
                  {allProjects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>Estado</Form.Label>
                <Form.Select 
                  value={filterEstado}
                  onChange={(e) => setFilterEstado(e.target.value)}
                >
                  <option value="all">Todos los estados</option>
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="EN_PROGRESO">En Progreso</option>
                  <option value="COMPLETADA">Completada</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>Prioridad</Form.Label>
                <Form.Select 
                  value={filterPrioridad}
                  onChange={(e) => setFilterPrioridad(e.target.value)}
                >
                  <option value="all">Todas las prioridades</option>
                  <option value="ALTA">Alta</option>
                  <option value="MEDIA">Media</option>
                  <option value="BAJA">Baja</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <div className="mt-3 d-flex justify-content-between align-items-center">
            <span className="text-muted">
              {totalResultados} resultado{totalResultados !== 1 ? 's' : ''} encontrado{totalResultados !== 1 ? 's' : ''}
            </span>
            <Button variant="outline-secondary" size="sm" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          </div>
        </Card.Body>
      </Card>

      <Row>
        {/* Resultados: Proyectos */}
        {projects.length > 0 && (
          <Col lg={6} className="mb-4">
            <Card>
              <Card.Header>
                <strong>
                  {(FaProjectDiagram as React.FC<IconBaseProps>)({ className: 'me-2' })}
                  Proyectos ({projects.length})
                </strong>
              </Card.Header>
              <ListGroup variant="flush" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {projects.map(project => (
                  <ListGroup.Item key={project.id}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center mb-1">
                          <div
                            style={{
                              width: '12px',
                              height: '12px',
                              backgroundColor: project.color,
                              borderRadius: '50%',
                              marginRight: '8px'
                            }}
                          />
                          <strong>{project.nombre}</strong>
                        </div>
                        <p className="small text-muted mb-1">
                          {project.descripcion || 'Sin descripción'}
                        </p>
                        <Badge bg={project.estado === 'ACTIVO' ? 'success' : 'secondary'}>
                          {project.estado}
                        </Badge>
                      </div>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => navigate('/proyectos')}
                      >
                        {(FaEdit as React.FC<IconBaseProps>)({})}
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card>
          </Col>
        )}

        {/* Resultados: Tareas */}
        {tasks.length > 0 && (
          <Col lg={6} className="mb-4">
            <Card>
              <Card.Header>
                <strong>
                  {(FaTasks as React.FC<IconBaseProps>)({ className: 'me-2' })}
                  Tareas ({tasks.length})
                </strong>
              </Card.Header>
              <ListGroup variant="flush" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {tasks.map(task => (
                  <ListGroup.Item key={task.id}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <strong>{task.nombre}</strong>
                        <div className="small text-muted">{task.proyecto.nombre}</div>
                        {task.descripcion && (
                          <p className="small mb-1">{task.descripcion}</p>
                        )}
                        <div className="d-flex gap-1 mt-1">
                          {getPrioridadBadge(task.prioridad)}
                          {getEstadoBadge(task.estado)}
                          {task.deadline && (
                            <Badge bg="info">
                              Vence: {new Date(task.deadline).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => navigate('/tareas')}
                      >
                        {(FaEdit as React.FC<IconBaseProps>)({})}
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card>
          </Col>
        )}

        {/* Sin resultados */}
        {totalResultados === 0 && searchTerm && (
          <Col>
            <Card>
              <Card.Body className="text-center text-muted">
                <p>No se encontraron resultados para "{searchTerm}"</p>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default SearchPage;