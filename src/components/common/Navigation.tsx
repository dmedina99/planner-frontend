import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaHome, FaProjectDiagram, FaTasks, FaClock, FaChartBar, FaCalendar, FaSearch } from 'react-icons/fa';
import { IconBaseProps } from "react-icons";

const Navigation: React.FC = () => {
  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="mb-3">
      <Container>
        <Navbar.Brand as={Link} to="/dashboard">
          {(FaProjectDiagram as React.FC<IconBaseProps>)({ className: "me-2" })}
          Task Planner
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/dashboard">
              {(FaHome as React.FC<IconBaseProps>)({ className: "me-1" })}
              Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/proyectos">
              {(FaProjectDiagram as React.FC<IconBaseProps>)({
                className: "me-1",
              })}
              Proyectos
            </Nav.Link>
            <Nav.Link as={Link} to="/tareas">
              {(FaTasks as React.FC<IconBaseProps>)({ className: "me-1" })}
              Tareas
            </Nav.Link>
            <Nav.Link as={Link} to="/timer">
              {(FaClock as React.FC<IconBaseProps>)({ className: "me-1" })}
              Timer
            </Nav.Link>
            <Nav.Link as={Link} to="/analytics">
              {(FaChartBar as React.FC<IconBaseProps>)({ className: "me-1" })}
              Analytics
            </Nav.Link>
            <Nav.Link as={Link} to="/calendario">
              {(FaCalendar as React.FC<IconBaseProps>)({ className: "me-1" })}
              Calendario
            </Nav.Link>
            <Nav.Link as={Link} to="/buscar">
              {(FaSearch as React.FC<IconBaseProps>)({ className: "me-1" })}
              Buscar
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
