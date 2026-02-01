import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import ProjectList from '../components/projects/ProjectList';
import { IconBaseProps } from 'react-icons';
const ProjectsPage: React.FC = () => {
  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Proyectos</h1>
        <Button 
          variant="primary"
          onClick={() => alert('Crear proyecto (próximamente)')}
        >
        {(FaPlus as React.FC<IconBaseProps>)({ className: 'me-1' })}
          Nuevo Proyecto
        </Button>
      </div>
      
      <ProjectList />
    </Container>
  );
};

export default ProjectsPage;