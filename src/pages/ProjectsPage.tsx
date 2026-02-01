import React, { useState } from 'react';
import { Container, Button } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import { IconBaseProps } from 'react-icons';
import ProjectList from '../components/projects/ProjectList';
import ProjectForm from '../components/projects/ProjectForm';
import { Project } from '../types';
import { projectApi } from '../services/api';

const ProjectsPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleShowCreate = () => {
    setSelectedProject(undefined);
    setShowForm(true);
  };

  const handleShowEdit = (project: Project) => {
    setSelectedProject(project);
    setShowForm(true);
  };

  const handleSave = async (project: Omit<Project, 'id' | 'fechaCreacion' | 'fechaActualizacion'>) => {
    try {
      if (selectedProject) {
        // Editar proyecto existente
        await projectApi.update(selectedProject.id!, project);
        alert('Proyecto actualizado correctamente');
      } else {
        // Crear nuevo proyecto
        await projectApi.create(project);
        alert('Proyecto creado correctamente');
      }
      
      // Recargar lista
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      alert('Error al guardar el proyecto');
      console.error(error);
    }
  };

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Proyectos</h1>
        <Button 
          variant="primary"
          onClick={handleShowCreate}
        >
          {(FaPlus as React.FC<IconBaseProps>)({ className: 'me-1' })}
          Nuevo Proyecto
        </Button>
      </div>
      
      <ProjectList key={refreshKey} onEdit={handleShowEdit} />

      <ProjectForm 
        show={showForm}
        onHide={() => setShowForm(false)}
        onSave={handleSave}
        project={selectedProject}
      />
    </Container>
  );
};

export default ProjectsPage;