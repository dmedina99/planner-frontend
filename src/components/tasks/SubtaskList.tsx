import React, { useState, useEffect } from "react";
import {
  Card,
  ListGroup,
  Badge,
  Button,
  Form,
  Collapse,
  InputGroup,
} from "react-bootstrap";
import { FaPlus, FaTrash, FaChevronDown, FaChevronRight } from "react-icons/fa";
import { IconBaseProps } from "react-icons";
import { Task } from "../../types";
import { taskApi } from "../../services/api";

interface SubtaskListProps {
  task: Task;
  onUpdate: () => void;
}

const SubtaskList: React.FC<SubtaskListProps> = ({ task, onUpdate }) => {
  const [subtareas, setSubtareas] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showSubtareas, setShowSubtareas] = useState(true);
  const [loading, setLoading] = useState(false);

  // Formulario nueva subtarea
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [prioridad, setPrioridad] = useState<Task["prioridad"]>("MEDIA");

  useEffect(() => {
    if (task.subtareas && task.subtareas.length > 0) {
      setSubtareas(task.subtareas);
    } else if (task.id) {
      loadSubtareas();
    }
  }, [task]);

  const loadSubtareas = async () => {
    if (!task.id) return;

    try {
      const response = await taskApi.getSubtareas(task.id);
      setSubtareas(response.data);
    } catch (error) {
      console.error("Error al cargar subtareas", error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.id || !nombre.trim()) return;

    try {
      setLoading(true);
      await taskApi.createSubtarea(task.id, {
        nombre,
        descripcion,
        prioridad,
        estado: "PENDIENTE",
      });

      // Resetear formulario
      setNombre("");
      setDescripcion("");
      setPrioridad("MEDIA");
      setShowForm(false);

      // Recargar subtareas
      await loadSubtareas();
      onUpdate();
    } catch (error) {
      alert("Error al crear la subtarea");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (subtareaId: number) => {
    if (!window.confirm("¿Eliminar esta subtarea?")) return;

    try {
      await taskApi.delete(subtareaId);
      await loadSubtareas();
      onUpdate();
    } catch (error) {
      alert("Error al eliminar la subtarea");
    }
  };

  const handleChangeEstado = async (
    subtareaId: number,
    nuevoEstado: Task["estado"],
  ) => {
    try {
      await taskApi.changeEstado(subtareaId, nuevoEstado);
      await loadSubtareas();
      onUpdate();
    } catch (error) {
      alert("Error al cambiar el estado");
    }
  };

  const getPrioridadColor = (prioridad: Task["prioridad"]) => {
    switch (prioridad) {
      case "ALTA":
        return "danger";
      case "MEDIA":
        return "warning";
      case "BAJA":
        return "info";
    }
  };

  const getEstadoColor = (estado: Task["estado"]) => {
    switch (estado) {
      case "PENDIENTE":
        return "secondary";
      case "EN_PROGRESO":
        return "primary";
      case "COMPLETADA":
        return "success";
    }
  };

  return (
    <Card className="mt-3">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div
          style={{ cursor: "pointer", flexGrow: 1 }}
          onClick={() => setShowSubtareas(!showSubtareas)}
        >
          <strong>
            {showSubtareas
              ? (FaChevronDown as React.FC<IconBaseProps>)({
                  className: "me-2",
                })
              : (FaChevronRight as React.FC<IconBaseProps>)({
                  className: "me-2",
                })}
            Subtareas ({subtareas.length})
          </strong>
        </div>
        <Button
          size="sm"
          variant="primary"
          onClick={() => setShowForm(!showForm)}
        >
          {(FaPlus as React.FC<IconBaseProps>)({ className: "me-1" })}
          Nueva
        </Button>
      </Card.Header>

      <Collapse in={showSubtareas}>
        <div>
          {/* Formulario crear subtarea */}
          <Collapse in={showForm}>
            <Card.Body className="border-bottom bg-light">
              <Form onSubmit={handleCreate}>
                <Form.Group className="mb-2">
                  <Form.Control
                    type="text"
                    placeholder="Nombre de la subtarea"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    autoFocus
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Descripción (opcional)"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                  />
                </Form.Group>

                <InputGroup className="mb-2">
                  <InputGroup.Text>Prioridad</InputGroup.Text>
                  <Form.Select
                    value={prioridad}
                    onChange={(e) =>
                      setPrioridad(e.target.value as Task["prioridad"])
                    }
                  >
                    <option value="BAJA">Baja</option>
                    <option value="MEDIA">Media</option>
                    <option value="ALTA">Alta</option>
                  </Form.Select>
                </InputGroup>

                <div className="d-flex gap-2">
                  <Button type="submit" size="sm" disabled={loading}>
                    {loading ? "Creando..." : "Crear"}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Collapse>

          {/* Lista de subtareas */}
          {subtareas.length === 0 ? (
            <Card.Body className="text-muted text-center">
              No hay subtareas. Añade una para dividir esta tarea en pasos más
              pequeños.
            </Card.Body>
          ) : (
            <ListGroup variant="flush">
              {subtareas.map((subtarea) => (
                <ListGroup.Item key={subtarea.id}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <strong>{subtarea.nombre}</strong>
                        <Badge bg={getPrioridadColor(subtarea.prioridad)}>
                          {subtarea.prioridad}
                        </Badge>
                      </div>

                      {subtarea.descripcion && (
                        <p className="small mb-2">{subtarea.descripcion}</p>
                      )}

                      <div className="d-flex gap-2 align-items-center">
                        <Form.Select
                          size="sm"
                          value={subtarea.estado}
                          onChange={(e) =>
                            subtarea.id &&
                            handleChangeEstado(
                              subtarea.id,
                              e.target.value as Task["estado"],
                            )
                          }
                          style={{ width: "auto" }}
                        >
                          <option value="PENDIENTE">Pendiente</option>
                          <option value="EN_PROGRESO">En Progreso</option>
                          <option value="COMPLETADA">Completada</option>
                        </Form.Select>

                        <Badge bg={getEstadoColor(subtarea.estado)}>
                          {subtarea.estado.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>

                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => subtarea.id && handleDelete(subtarea.id)}
                    >
                      {(FaTrash as React.FC<IconBaseProps>)({})}
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </div>
      </Collapse>
    </Card>
  );
};

export default SubtaskList;
