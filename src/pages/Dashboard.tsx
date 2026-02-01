import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const Dashboard: React.FC = () => {
  return (
    <Container>
      <h1 className="mb-4">Dashboard</h1>
      <Row>
        <Col md={4}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Proyectos Activos</Card.Title>
              <h2 className="text-primary">0</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Tareas Pendientes</Card.Title>
              <h2 className="text-warning">0</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Tareas Completadas</Card.Title>
              <h2 className="text-success">0</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;