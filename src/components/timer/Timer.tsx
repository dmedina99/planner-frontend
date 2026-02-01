import React, { useState, useEffect } from "react";
import { Card, Button, Form, Badge, Alert } from "react-bootstrap";
import { FaPlay, FaPause, FaStop, FaSave } from "react-icons/fa";
import { IconBaseProps } from "react-icons";
import { Task } from "../../types";
import { taskApi, timeRecordApi } from "../../services/api";

interface TimerProps {
  onRecordSaved?: () => void;
}

const Timer: React.FC<TimerProps> = ({ onRecordSaved }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<number>(0);
  const [notas, setNotas] = useState("");

  const [segundos, setSegundos] = useState(0);
  const [corriendo, setCorriendo] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // Cargar tareas al montar
  useEffect(() => {
    loadTasks();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer logic
  useEffect(() => {
    let intervalo: NodeJS.Timeout;

    if (corriendo) {
      intervalo = setInterval(() => {
        setSegundos((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(intervalo);
  }, [corriendo]);

  const loadTasks = async () => {
    try {
      const response = await taskApi.getAll();
      // Filtrar solo tareas no completadas
      const tareasActivas = response.data.filter(
        (t) => t.estado !== "COMPLETADA",
      );
      setTasks(tareasActivas);

      if (tareasActivas.length > 0 && selectedTaskId === 0) {
        setSelectedTaskId(tareasActivas[0].id || 0);
      }
    } catch (error) {
      console.error("Error al cargar tareas", error);
    }
  };

  const handleIniciar = () => {
    if (selectedTaskId === 0) {
      setMensaje("Por favor selecciona una tarea");
      return;
    }
    setCorriendo(true);
    setMensaje("");
  };

  const handlePausar = () => {
    setCorriendo(false);
  };

  const handleDetener = () => {
    setCorriendo(false);
    setSegundos(0);
    setMensaje("");
  };

  const handleGuardar = async () => {
    if (selectedTaskId === 0) {
      setMensaje("Por favor selecciona una tarea");
      return;
    }

    if (segundos < 60) {
      setMensaje("Debes tener al menos 1 minuto registrado");
      return;
    }

    const minutos = Math.floor(segundos / 60);

    try {
      setCorriendo(false);

      await timeRecordApi.create(selectedTaskId, {
        tiempoDedicado: minutos,
        fecha: new Date().toISOString().split("T")[0],
        notas: notas || undefined,
      });

      setMensaje(`✅ ${minutos} minutos guardados correctamente`);
      setSegundos(0);
      setNotas("");

      // Notificar que se guardó el registro
      if (onRecordSaved) {
        onRecordSaved();
      }
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMensaje(""), 3000);
    } catch (error) {
      setMensaje("❌ Error al guardar el registro");
      console.error(error);
    }
  };

  // Formatear tiempo
  const formatearTiempo = (totalSegundos: number) => {
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segs = totalSegundos % 60;

    return `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}:${String(segs).padStart(2, "0")}`;
  };

  return (
    <Card>
      <Card.Header>
        <strong>⏱️ Timer de Trabajo</strong>
        {corriendo && (
          <Badge bg="success" className="ms-2">
            Corriendo
          </Badge>
        )}
      </Card.Header>
      <Card.Body>
        {/* Selector de tarea */}
        <Form.Group className="mb-3">
          <Form.Label>Tarea</Form.Label>
          <Form.Select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(Number(e.target.value))}
            disabled={corriendo}
          >
            <option value={0}>Selecciona una tarea</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.proyecto.nombre} - {task.nombre}
              </option>
            ))}
          </Form.Select>
          {corriendo && (
            <Form.Text className="text-muted">
              No puedes cambiar de tarea mientras el timer está corriendo
            </Form.Text>
          )}
        </Form.Group>

        {/* Display del tiempo */}
        <div className="text-center mb-4">
          <h1
            className="display-3 mb-0"
            style={{
              fontFamily: "monospace",
              color: corriendo ? "#198754" : "#6c757d",
            }}
          >
            {formatearTiempo(segundos)}
          </h1>
          <small className="text-muted">
            {Math.floor(segundos / 60)} minutos
          </small>
        </div>

        {/* Botones de control */}
        <div className="d-flex gap-2 mb-3 justify-content-center">
          {!corriendo ? (
            <Button
              variant="success"
              onClick={handleIniciar}
              disabled={selectedTaskId === 0}
            >
              {(FaPlay as React.FC<IconBaseProps>)({ className: "me-1" })}
              {segundos === 0 ? "Iniciar" : "Reanudar"}
            </Button>
          ) : (
            <Button variant="warning" onClick={handlePausar}>
              {(FaPause as React.FC<IconBaseProps>)({ className: "me-1" })}
              Pausar
            </Button>
          )}

          <Button
            variant="danger"
            onClick={handleDetener}
            disabled={segundos === 0}
          >
            {(FaStop as React.FC<IconBaseProps>)({ className: "me-1" })}
            Detener
          </Button>

          <Button
            variant="primary"
            onClick={handleGuardar}
            disabled={segundos < 60 || corriendo}
          >
            {(FaSave as React.FC<IconBaseProps>)({ className: "me-1" })}
            Guardar
          </Button>
        </div>

        {/* Notas */}
        <Form.Group>
          <Form.Label>Notas (opcional)</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            placeholder="¿Qué has estado haciendo?"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            disabled={corriendo}
          />
        </Form.Group>

        {/* Mensajes */}
        {mensaje && (
          <Alert
            variant={
              mensaje.includes("✅")
                ? "success"
                : mensaje.includes("❌")
                  ? "danger"
                  : "info"
            }
            className="mt-3 mb-0"
          >
            {mensaje}
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default Timer;
