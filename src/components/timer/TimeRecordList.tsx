import React, { useEffect, useState } from 'react';
import { Card, ListGroup, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { FaTrash, FaClock } from 'react-icons/fa';
import { IconBaseProps } from 'react-icons';
import { TimeRecord } from '../../types';
import { timeRecordApi } from '../../services/api';

interface TimeRecordListProps {
  refreshKey?: number;
}

const TimeRecordList: React.FC<TimeRecordListProps> = ({ refreshKey }) => {
  const [records, setRecords] = useState<TimeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRecords();
  }, [refreshKey]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const response = await timeRecordApi.getAll();
      // Ordenar por fecha más reciente
      const sorted = response.data.sort((a, b) => {
        return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
      });
      setRecords(sorted);
      setError('');
    } catch (err) {
      setError('Error al cargar los registros');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este registro?')) {
      try {
        await timeRecordApi.delete(id);
        loadRecords();
      } catch (err) {
        alert('Error al eliminar el registro');
      }
    }
  };

  const formatearTiempo = (minutos: number) => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    
    if (horas === 0) {
      return `${mins}m`;
    }
    return `${horas}h ${mins}m`;
  };

  const calcularTotalHoy = () => {
    const hoy = new Date().toISOString().split('T')[0];
    const registrosHoy = records.filter(r => r.fecha === hoy);
    const totalMinutos = registrosHoy.reduce((sum, r) => sum + r.tiempoDedicado, 0);
    return formatearTiempo(totalMinutos);
  };

  const calcularTotalSemana = () => {
    const hoy = new Date();
    const hace7Dias = new Date();
    hace7Dias.setDate(hoy.getDate() - 7);
    
    const registrosSemana = records.filter(r => {
      const fecha = new Date(r.fecha);
      return fecha >= hace7Dias && fecha <= hoy;
    });
    
    const totalMinutos = registrosSemana.reduce((sum, r) => sum + r.tiempoDedicado, 0);
    return formatearTiempo(totalMinutos);
  };

  if (loading) {
    return (
      <Card>
        <Card.Body className="text-center">
          <Spinner animation="border" size="sm" /> Cargando registros...
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Card.Body>
          <Alert variant="danger" className="mb-0">{error}</Alert>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <strong>📊 Registros de Tiempo</strong>
        <div>
          <Badge bg="info" className="me-2">Hoy: {calcularTotalHoy()}</Badge>
          <Badge bg="primary">Semana: {calcularTotalSemana()}</Badge>
        </div>
      </Card.Header>
      
      {records.length === 0 ? (
        <Card.Body>
          <p className="text-muted mb-0">No hay registros de tiempo aún</p>
        </Card.Body>
      ) : (
        <ListGroup variant="flush" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {records.slice(0, 20).map(record => (
            <ListGroup.Item key={record.id}>
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <strong>{record.tarea.nombre}</strong>
                  <div className="small text-muted">{record.tarea.proyecto.nombre}</div>
                  
                  <div className="mt-1">
                    <Badge bg="success" className="me-2">
                      {(FaClock as React.FC<IconBaseProps>)({ className: 'me-1' })}
                      {formatearTiempo(record.tiempoDedicado)}
                    </Badge>
                    <span className="small text-muted">
                      {new Date(record.fecha).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {record.notas && (
                    <div className="small mt-1" style={{ fontStyle: 'italic' }}>
                      "{record.notas}"
                    </div>
                  )}
                </div>
                
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => record.id && handleDelete(record.id)}
                >
                  {(FaTrash as React.FC<IconBaseProps>)({})}
                </Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
      
      {records.length > 20 && (
        <Card.Footer className="text-muted text-center small">
          Mostrando los últimos 20 registros
        </Card.Footer>
      )}
    </Card>
  );
};

export default TimeRecordList;