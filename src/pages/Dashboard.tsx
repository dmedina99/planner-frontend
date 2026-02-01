import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, ListGroup, Badge, Spinner, Alert } from 'react-bootstrap';
import { FaProjectDiagram, FaTasks, FaCheckCircle, FaClock } from 'react-icons/fa';
import { IconBaseProps } from 'react-icons';
import { Project, Task } from '../types';
import { projectApi, taskApi } from '../services/api';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsRes, tasksRes] = await Promise.all([
        projectApi.getAll(),
        taskApi.getAll()
      ]);
      setProjects(projectsRes.data);
      setTasks(tasksRes.data);
      setError('');
    } catch (err) {
      setError('Error al cargar los datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Cargando dashboard...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  // Estadísticas
  const proyectosActivos = projects.filter(p => p.estado === 'ACTIVO').length;
  const tareasPendientes = tasks.filter(t => t.estado === 'PENDIENTE').length;
  const tareasEnProgreso = tasks.filter(t => t.estado === 'EN_PROGRESO').length;
  const tareasCompletadas = tasks.filter(t => t.estado === 'COMPLETADA').length;

  // Tareas próximas a vencer (próximos 7 días)
  const hoy = new Date();
  const proximos7Dias = new Date();
  proximos7Dias.setDate(hoy.getDate() + 7);

  const tareasProximasVencer = tasks.filter(t => {
    if (!t.deadline || t.estado === 'COMPLETADA') return false;
    const deadline = new Date(t.deadline);
    return deadline >= hoy && deadline <= proximos7Dias;
  }).sort((a, b) => {
    const dateA = new Date(a.deadline!);
    const dateB = new Date(b.deadline!);
    return dateA.getTime() - dateB.getTime();
  });

  // Tareas vencidas
  const tareasVencidas = tasks.filter(t => {
    if (!t.deadline || t.estado === 'COMPLETADA') return false;
    const deadline = new Date(t.deadline);
    return deadline < hoy;
  });

  const getPrioridadColor = (prioridad: Task['prioridad']) => {
    switch (prioridad) {
      case 'ALTA': return 'danger';
      case 'MEDIA': return 'warning';
      case 'BAJA': return 'info';
    }
  };

  return (
    <Container>
      <h1 className="mb-4">Dashboard</h1>

      {/* Estadísticas principales */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="mb-3 text-center">
            <Card.Body>
              <div className="mb-2">
                {(FaProjectDiagram as React.FC<IconBaseProps>)({ 
                  style: { fontSize: '2rem', color: '#0d6efd' } 
                })}
              </div>
              <Card.Title>Proyectos Activos</Card.Title>
              <h2 className="text-primary mb-0">{proyectosActivos}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="mb-3 text-center">
            <Card.Body>
              <div className="mb-2">
                {(FaTasks as React.FC<IconBaseProps>)({ 
                  style: { fontSize: '2rem', color: '#6c757d' } 
                })}
              </div>
              <Card.Title>Tareas Pendientes</Card.Title>
              <h2 className="text-secondary mb-0">{tareasPendientes}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="mb-3 text-center">
            <Card.Body>
              <div className="mb-2">
                {(FaClock as React.FC<IconBaseProps>)({ 
                  style: { fontSize: '2rem', color: '#0dcaf0' } 
                })}
              </div>
              <Card.Title>En Progreso</Card.Title>
              <h2 className="text-info mb-0">{tareasEnProgreso}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="mb-3 text-center">
            <Card.Body>
              <div className="mb-2">
                {(FaCheckCircle as React.FC<IconBaseProps>)({ 
                  style: { fontSize: '2rem', color: '#198754' } 
                })}
              </div>
              <Card.Title>Completadas</Card.Title>
              <h2 className="text-success mb-0">{tareasCompletadas}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Tareas vencidas */}
        {tareasVencidas.length > 0 && (
          <Col md={6} className="mb-4">
            <Card border="danger">
              <Card.Header className="bg-danger text-white">
                <strong>⚠️ Tareas Vencidas ({tareasVencidas.length})</strong>
              </Card.Header>
              <ListGroup variant="flush">
                {tareasVencidas.slice(0, 5).map(task => (
                  <ListGroup.Item key={task.id}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <strong>{task.nombre}</strong>
                        <div className="small text-muted">{task.proyecto.nombre}</div>
                        <div className="small text-danger">
                          Venció: {new Date(task.deadline!).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge bg={getPrioridadColor(task.prioridad)}>
                        {task.prioridad}
                      </Badge>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              {tareasVencidas.length > 5 && (
                <Card.Footer className="text-center">
                  <Link to="/tareas">Ver todas las tareas vencidas</Link>
                </Card.Footer>
              )}
            </Card>
          </Col>
        )}

        {/* Tareas próximas a vencer */}
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header>
              <strong>📅 Próximas a Vencer (7 días)</strong>
            </Card.Header>
            {tareasProximasVencer.length === 0 ? (
              <Card.Body>
                <p className="text-muted mb-0">No hay tareas próximas a vencer</p>
              </Card.Body>
            ) : (
              <>
                <ListGroup variant="flush">
                  {tareasProximasVencer.slice(0, 5).map(task => (
                    <ListGroup.Item key={task.id}>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <strong>{task.nombre}</strong>
                          <div className="small text-muted">{task.proyecto.nombre}</div>
                          <div className="small">
                            {(FaClock as React.FC<IconBaseProps>)({ className: 'me-1' })}
                            {new Date(task.deadline!).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge bg={getPrioridadColor(task.prioridad)}>
                          {task.prioridad}
                        </Badge>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
                {tareasProximasVencer.length > 5 && (
                  <Card.Footer className="text-center">
                    <Link to="/tareas">Ver todas</Link>
                  </Card.Footer>
                )}
              </>
            )}
          </Card>
        </Col>

        {/* Distribución por proyecto */}
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header>
              <strong>📊 Tareas por Proyecto</strong>
            </Card.Header>
            <ListGroup variant="flush">
              {projects.filter(p => p.estado === 'ACTIVO').map(project => {
                const tareasProyecto = tasks.filter(t => t.proyecto.id === project.id);
                const pendientes = tareasProyecto.filter(t => t.estado === 'PENDIENTE').length;
                const completadas = tareasProyecto.filter(t => t.estado === 'COMPLETADA').length;
                
                return (
                  <ListGroup.Item key={project.id}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div 
                          style={{ 
                            display: 'inline-block',
                            width: '12px',
                            height: '12px',
                            backgroundColor: project.color,
                            borderRadius: '50%',
                            marginRight: '8px'
                          }}
                        />
                        <strong>{project.nombre}</strong>
                      </div>
                      <div>
                        <Badge bg="secondary" className="me-1">{pendientes} pendientes</Badge>
                        <Badge bg="success">{completadas} completadas</Badge>
                      </div>
                    </div>
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;