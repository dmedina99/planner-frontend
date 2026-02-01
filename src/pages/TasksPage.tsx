import React, { useState } from 'react';
import { Container, Button } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import { IconBaseProps } from 'react-icons';
import TaskList from '../components/tasks/TaskList';
import TaskForm from '../components/tasks/TaskForm';
import { Task } from '../types';
import { taskApi } from '../services/api';

const TasksPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleShowCreate = () => {
    setSelectedTask(undefined);
    setShowForm(true);
  };

  const handleShowEdit = (task: Task) => {
    setSelectedTask(task);
    setShowForm(true);
  };

  const handleSave = async (
    task: Omit<Task, 'id' | 'proyecto' | 'fechaCreacion' | 'fechaActualizacion'>,
    proyectoId: number
  ) => {
    try {
      if (selectedTask) {
        // Editar tarea existente
        await taskApi.update(selectedTask.id!, task);
        alert('Tarea actualizada correctamente');
      } else {
        // Crear nueva tarea
        await taskApi.create(proyectoId, task);
        alert('Tarea creada correctamente');
      }
      
      // Recargar lista
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      alert('Error al guardar la tarea');
      console.error(error);
    }
  };

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Tareas</h1>
        <Button 
          variant="primary"
          onClick={handleShowCreate}
        >
          {(FaPlus as React.FC<IconBaseProps>)({ className: 'me-1' })}
          Nueva Tarea
        </Button>
      </div>
      
      <TaskList key={refreshKey} onEdit={handleShowEdit} />

      <TaskForm 
        show={showForm}
        onHide={() => setShowForm(false)}
        onSave={handleSave}
        task={selectedTask}
      />
    </Container>
  );
};

export default TasksPage;