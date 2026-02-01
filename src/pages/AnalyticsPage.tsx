import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Form,
} from "react-bootstrap";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Project, Task, TimeRecord } from "../types";
import { projectApi, taskApi, timeRecordApi } from "../services/api";

const AnalyticsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [diasGrafico, setDiasGrafico] = useState(7);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsRes, tasksRes, timeRes] = await Promise.all([
        projectApi.getAll(),
        taskApi.getAll(),
        timeRecordApi.getAll(),
      ]);
      setProjects(projectsRes.data);
      setTasks(tasksRes.data);
      setTimeRecords(timeRes.data);
      setError("");
    } catch (err) {
      setError("Error al cargar los datos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Cargando analytics...</p>
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

  // ========== DATOS PARA GRÁFICO CIRCULAR: TIEMPO POR PROYECTO ==========
  const tiempoPorProyecto = projects
    .map((project) => {
      const tareasProyecto = tasks.filter((t) => t.proyecto.id === project.id);
      const tiempoTotal = timeRecords
        .filter((tr) => tareasProyecto.some((t) => t.id === tr.tarea.id))
        .reduce((sum, tr) => sum + tr.tiempoDedicado, 0);

      return {
        name: project.nombre,
        value: tiempoTotal,
        color: project.color,
      };
    })
    .filter((p) => p.value > 0); // Solo proyectos con tiempo registrado

  const COLORS = tiempoPorProyecto.map((p) => p.color);

  // ========== DATOS PARA GRÁFICO DE BARRAS: PRODUCTIVIDAD DIARIA ==========
  const obtenerUltimosDias = (dias: number) => {
    const hoy = new Date();
    const fechas = [];

    for (let i = dias - 1; i >= 0; i--) {
      const fecha = new Date();
      fecha.setDate(hoy.getDate() - i);
      fechas.push(fecha.toISOString().split("T")[0]);
    }

    return fechas;
  };

  const productividadDiaria = obtenerUltimosDias(diasGrafico).map((fecha) => {
    const registrosDia = timeRecords.filter((tr) => tr.fecha === fecha);
    const minutos = registrosDia.reduce(
      (sum, tr) => sum + tr.tiempoDedicado,
      0,
    );

    return {
      fecha: new Date(fecha).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
      }),
      minutos: minutos,
      horas: parseFloat((minutos / 60).toFixed(1)),
    };
  });

  // ========== DATOS PARA GRÁFICO DE DONA: TAREAS POR ESTADO ==========
  const tareasPorEstado = [
    {
      name: "Pendientes",
      value: tasks.filter((t) => t.estado === "PENDIENTE").length,
      color: "#6c757d",
    },
    {
      name: "En Progreso",
      value: tasks.filter((t) => t.estado === "EN_PROGRESO").length,
      color: "#0dcaf0",
    },
    {
      name: "Completadas",
      value: tasks.filter((t) => t.estado === "COMPLETADA").length,
      color: "#198754",
    },
  ].filter((e) => e.value > 0);

  const ESTADO_COLORS = tareasPorEstado.map((e) => e.color);

  // ========== ESTADÍSTICAS GENERALES ==========
  const tiempoTotal = timeRecords.reduce(
    (sum, tr) => sum + tr.tiempoDedicado,
    0,
  );
  const horasTotales = Math.floor(tiempoTotal / 60);
  const minutosTotales = tiempoTotal % 60;

  return (
    <Container>
      <h1 className="mb-4">📊 Analytics</h1>

      {/* Estadísticas generales */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h6 className="text-muted">Total Proyectos</h6>
              <h2 className="mb-0">{projects.length}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h6 className="text-muted">Total Tareas</h6>
              <h2 className="mb-0">{tasks.length}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h6 className="text-muted">Registros de Tiempo</h6>
              <h2 className="mb-0">{timeRecords.length}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h6 className="text-muted">Tiempo Total</h6>
              <h2 className="mb-0">
                {horasTotales}h {minutosTotales}m
              </h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Gráfico: Tiempo por Proyecto */}
        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header>
              <strong>⏱️ Tiempo por Proyecto</strong>
            </Card.Header>
            <Card.Body>
              {tiempoPorProyecto.length === 0 ? (
                <p className="text-muted">No hay datos de tiempo registrados</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={tiempoPorProyecto}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {tiempoPorProyecto.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) =>
                        `${Math.floor((value as number) / 60)}h ${(value as number) % 60}m`
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Gráfico: Tareas por Estado */}
        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header>
              <strong>📋 Tareas por Estado</strong>
            </Card.Header>
            <Card.Body>
              {tareasPorEstado.length === 0 ? (
                <p className="text-muted">No hay tareas creadas</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={tareasPorEstado}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {tareasPorEstado.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={ESTADO_COLORS[index % ESTADO_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Gráfico: Productividad Diaria */}
      <Row>
        <Col lg={12} className="mb-4">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <strong>📈 Productividad Diaria</strong>
              <Form.Select
                style={{ width: "200px" }}
                value={diasGrafico}
                onChange={(e) => setDiasGrafico(Number(e.target.value))}
              >
                <option value={7}>Últimos 7 días</option>
                <option value={14}>Últimos 14 días</option>
                <option value={30}>Últimos 30 días</option>
              </Form.Select>
            </Card.Header>
            <Card.Body>
              {productividadDiaria.every((d) => d.minutos === 0) ? (
                <p className="text-muted">
                  No hay datos de productividad para este período
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={productividadDiaria}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fecha" />
                    <YAxis
                      label={{
                        value: "Horas",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip formatter={(value) => `${value} horas`} />
                    <Legend />
                    <Bar
                      dataKey="horas"
                      fill="#0d6efd"
                      name="Horas trabajadas"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AnalyticsPage;
