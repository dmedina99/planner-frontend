import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Navigation from './components/common/Navigation';

// Páginas
import Dashboard from './pages/Dashboard';
import ProjectsPage from './pages/ProjectsPage';
import TasksPage from './pages/TasksPage';
import TimerPage from './pages/TimerPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CalendarPage from './pages/CalendarPage';

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
            <Route path="/timer" element={<TimerPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/calendario" element={<CalendarPage />} />
          </Routes>
        </Container>
      </div>
    </Router>
  );
};

export default App;