import React, { useEffect, useState } from 'react';
import { Card, Button, Badge, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { FaEdit, FaTrash, FaArchive } from 'react-icons/fa';
import { IconBaseProps } from 'react-icons';
import { Project } from '../../types';
import { projectApi } from '../../services/api';

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Cargar proyectos al montar el componente
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projectApi.getAll();
      setProjects(response.data);
      setError('');
    } catch (err) {
      setError('Error al cargar los proyectos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este proyecto?')) {
      try {
        await projectApi.delete(id);
        loadProjects(); // Recargar lista
      } catch (err) {
        alert('Error al eliminar el proyecto');
      }
    }
  };

  const handleToggleArchive = async (id: number) => {
    try {
      await projectApi.toggleArchivar(id);
      loadProjects(); // Recargar lista
    } catch (err) {
      alert('Error al archivar/desarchivar el proyecto');
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Cargando proyectos...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (projects.length === 0) {
    return (
      <Alert variant="info">
        No hay proyectos creados. ¡Crea tu primer proyecto!
      </Alert>
    );
  }

  return (
    <Row>
      {projects.map((project) => (
        <Col md={6} lg={4} key={project.id} className="mb-3">
          <Card>
            <Card.Header 
              style={{ 
                backgroundColor: project.color, 
                color: '#fff',
                fontWeight: 'bold'
              }}
            >
              {project.nombre}
              <Badge 
                bg={project.estado === 'ACTIVO' ? 'success' : 'secondary'} 
                className="float-end"
              >
                {project.estado}
              </Badge>
            </Card.Header>
            <Card.Body>
              <Card.Text>{project.descripcion}</Card.Text>
              <div className="d-flex gap-2">
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => alert('Editar (próximamente)')}
                >
                    
            {(FaEdit as React.FC<IconBaseProps>)({ className: 'me-1' })} Editar
                </Button>
                <Button 
                  variant="warning" 
                  size="sm"
                  onClick={() => project.id && handleToggleArchive(project.id)}
                >
                 {(FaArchive as React.FC<IconBaseProps>)({})}
                  {project.estado === 'ACTIVO' ? ' Archivar' : ' Activar'}
                </Button>
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => project.id && handleDelete(project.id)}
                >
                 {(FaTrash as React.FC<IconBaseProps>)({ className: 'me-1' })} Eliminar
                </Button>
              </div>
            </Card.Body>
            <Card.Footer className="text-muted small">
              Creado: {new Date(project.fechaCreacion!).toLocaleDateString()}
            </Card.Footer>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default ProjectList;