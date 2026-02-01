import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Badge,
  Spinner,
  Alert,
  Modal,
  Button,
} from "react-bootstrap";
import { Calendar, momentLocalizer, Event } from "react-big-calendar";
import moment from "moment";
import "moment/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Task } from "../types";
import { taskApi } from "../services/api";

// Configurar moment en español
moment.locale("es");
const localizer = momentLocalizer(moment);

// Definir el tipo de evento para el calendario
interface CalendarEvent extends Event {
  task: Task;
}

const CalendarPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day' | 'agenda' | 'work_week'>('month');
const [currentDate, setCurrentDate] = useState<Date>(new Date()); 
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await taskApi.getAll();
      setTasks(response.data);
      console.log("Tareas cargadas:", response.data);
      console.log(
        "Tareas con deadline:",
        response.data.filter((t) => t.deadline),
      );
      setError("");
    } catch (err) {
      setError("Error al cargar las tareas");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Convertir tareas a eventos del calendario
  const events: CalendarEvent[] = tasks
    .filter((task) => task.deadline) // Solo tareas con deadline
    .map((task) => ({
      title: task.nombre,
      start: new Date(task.deadline!),
      end: new Date(task.deadline!),
      task: task,
    }));
  console.log("Eventos del calendario:", events);
  // Función para personalizar el estilo de los eventos
  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = "#3174ad";

    // Color según prioridad
    switch (event.task.prioridad) {
      case "ALTA":
        backgroundColor = "#dc3545";
        break;
      case "MEDIA":
        backgroundColor = "#ffc107";
        break;
      case "BAJA":
        backgroundColor = "#17a2b8";
        break;
    }

    // Si está completada, color verde
    if (event.task.estado === "COMPLETADA") {
      backgroundColor = "#28a745";
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "5px",
        opacity: 0.8,
        color: "white",
        border: "0px",
        display: "block",
      },
    };
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedTask(event.task);
    setShowModal(true);
  };

  const getPrioridadBadge = (prioridad: Task["prioridad"]) => {
    const colors = {
      ALTA: "danger",
      MEDIA: "warning",
      BAJA: "info",
    };
    return <Badge bg={colors[prioridad]}>{prioridad}</Badge>;
  };

  const getEstadoBadge = (estado: Task["estado"]) => {
    const colors = {
      PENDIENTE: "secondary",
      EN_PROGRESO: "primary",
      COMPLETADA: "success",
    };
    return <Badge bg={colors[estado]}>{estado.replace("_", " ")}</Badge>;
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Cargando calendario...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container fluid>
      <h1 className="mb-4">📅 Calendario de Tareas</h1>

      {/* Leyenda */}
      <Card className="mb-3">
        <Card.Body>
          <strong className="me-3">Leyenda:</strong>
          <Badge bg="danger" className="me-2">
            Alta Prioridad
          </Badge>
          <Badge bg="warning" text="dark" className="me-2">
            Media Prioridad
          </Badge>
          <Badge bg="info" className="me-2">
            Baja Prioridad
          </Badge>
          <Badge bg="success" className="me-2">
            Completada
          </Badge>
        </Card.Body>
      </Card>

      {/* Calendario */}
      <Card>
        <Card.Body style={{ height: "700px", padding: "20px" }}>
          {events.length === 0 ? (
            <Alert variant="info">
              No hay tareas con fecha límite (deadline). Añade deadlines a tus
              tareas para verlas en el calendario.
            </Alert>
          ) : (
<Calendar
  localizer={localizer}
  events={events}
  startAccessor="start"
  endAccessor="end"
  style={{ height: "650px" }}
  eventPropGetter={eventStyleGetter}
  onSelectEvent={handleSelectEvent}
  view={currentView}
  onView={(view) => setCurrentView(view)}
   date={currentDate}                           // AÑADIR ESTA LÍNEA
  onNavigate={(date) => setCurrentDate(date)}  
  messages={{
                next: "Siguiente",
                previous: "Anterior",
                today: "Hoy",
                month: "Mes",
                week: "Semana",
                day: "Día",
                agenda: "Agenda",
                date: "Fecha",
                time: "Hora",
                event: "Tarea",
                noEventsInRange: "No hay tareas en este rango",
                showMore: (total) => `+ Ver más (${total})`,
              }}
              views={["month", "week", "day", "agenda"]}
              defaultView="month"
            />
          )}
        </Card.Body>
      </Card>

      {/* Modal con detalles de la tarea */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Detalles de la Tarea</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTask && (
            <>
              <h5>{selectedTask.nombre}</h5>
              <p className="text-muted">{selectedTask.proyecto.nombre}</p>

              <hr />

              <div className="mb-2">
                <strong>Descripción:</strong>
                <p>{selectedTask.descripcion || "Sin descripción"}</p>
              </div>

              <div className="mb-2">
                <strong>Prioridad:</strong>{" "}
                {getPrioridadBadge(selectedTask.prioridad)}
              </div>

              <div className="mb-2">
                <strong>Estado:</strong> {getEstadoBadge(selectedTask.estado)}
              </div>

              <div className="mb-2">
                <strong>Fecha límite:</strong>{" "}
                {selectedTask.deadline
                  ? new Date(selectedTask.deadline).toLocaleDateString(
                      "es-ES",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )
                  : "Sin fecha"}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CalendarPage;
