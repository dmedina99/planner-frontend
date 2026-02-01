import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Timer from "../components/timer/Timer";
import TimeRecordList from "../components/timer/TimeRecordList";

const TimerPage: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  // Esta función se puede llamar desde el Timer cuando se guarda un registro
  const handleRecordSaved = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <Container>
      <h1 className="mb-4">Registro de Tiempo</h1>

      <Row>
        <Col lg={6} className="mb-4">
          <Timer onRecordSaved={handleRecordSaved} />
        </Col>
        <Col lg={6} className="mb-4">
          <TimeRecordList key={refreshKey} />
        </Col>
      </Row>
    </Container>
  );
};

export default TimerPage;
