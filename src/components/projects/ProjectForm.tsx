import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { Project } from '../../types';

interface ProjectFormProps {
  show: boolean;
  onHide: () => void;
  onSave: (project: Omit<Project, 'id' | 'fechaCreacion' | 'fechaActualizacion'>) => void;
  project?: Project;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ show, onHide, onSave, project }) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [color, setColor] = useState('#0066cc');

  // Cargar datos del proyecto si estamos editando
  useEffect(() => {
    if (project) {
      setNombre(project.nombre);
      setDescripcion(project.descripcion);
      setColor(project.color);
    } else {
      // Resetear formulario si no hay proyecto (modo crear)
      setNombre('');
      setDescripcion('');
      setColor('#0066cc');
    }
  }, [project, show]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSave({
      nombre,
      descripcion,
      color,
      estado: 'ACTIVO'
    });

    // Cerrar modal
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{project ? 'Editar Proyecto' : 'Nuevo Proyecto'}</Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Nombre del Proyecto *</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej: Rediseño de la web"
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
              placeholder="Describe el proyecto..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Color</Form.Label>
            <div className="d-flex align-items-center gap-2">
              <Form.Control
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ width: '60px', height: '40px' }}
              />
              <Form.Control
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#0066cc"
              />
            </div>
            <Form.Text className="text-muted">
              Este color se usará para identificar visualmente el proyecto
            </Form.Text>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            {project ? 'Guardar Cambios' : 'Crear Proyecto'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ProjectForm;