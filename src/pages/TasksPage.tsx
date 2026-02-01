import React from 'react';
import { Container } from 'react-bootstrap';

const TasksPage: React.FC = () => {
  return (
    <Container>
      <h1 className="mb-4">Tareas</h1>
      <p>Aquí irá la lista de tareas</p>
    </Container>
  );
};

export default TasksPage;