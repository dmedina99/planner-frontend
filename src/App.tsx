import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Navigation from './components/common/Navigation';

// Páginas (las crearemos después)
import Dashboard from './pages/Dashboard';
import ProjectsPage from './pages/ProjectsPage';
import TasksPage from './pages/TasksPage';

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <Container className="mt-4">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/proyectos" element={<ProjectsPage />} />
            <Route path="/tareas" element={<TasksPage />} />
          </Routes>
        </Container>
      </div>
    </Router>
  );
};

export default App;