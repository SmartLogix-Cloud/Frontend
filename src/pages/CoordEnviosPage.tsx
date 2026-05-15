import { Row, Col, Card, Button, Table, Badge, Form } from 'react-bootstrap';

// Datos de prueba basados exactamente en tu foto
const DATOS_MOCK = [
  { id: 1, tracking: 'TRK-98234-A', driver: 'Mario Ríos', destino: 'Av. Reforma 221, CDMX', tiempo: '14:30 - Hoy', estado: 'En Tránsito' },
  { id: 2, tracking: 'TRK-98235-B', driver: 'Ana López', destino: 'Blvd. Puerta de Hierro, GDL', tiempo: '09:00 - Mañana', estado: 'Pendiente' },
  { id: 3, tracking: 'TRK-98236-C', driver: 'Juan Gómez', destino: 'Parque Industrial MTY', tiempo: '11:15 - Hoy', estado: 'Entregado' },
];

export default function CoordEnviosPage() {
  return (
    <div>
      {/* Encabezado */}
      <Row className="mb-4 align-items-center">
        <Col>
          <h2 className="fw-bold">Coordinación de Envíos</h2>
          <p className="text-muted">Gestione rutas, supervise transportistas y optimice entregas en tiempo real.</p>
        </Col>
        <Col xs="auto">
          <Button variant="dark" className="me-2 shadow-sm">+ Planificar Nueva Ruta</Button>
          <Button variant="success" className="shadow-sm">Comunicación</Button>
        </Col>
      </Row>

      {/* Fila de Contenido Superior (Mapa y Stats) */}
      <Row className="mb-4">
        <Col lg={8}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white py-3"><strong>Rutas Activas</strong></Card.Header>
            <Card.Body className="d-flex align-items-center justify-content-center bg-light">
               <span className="text-muted small">[ Aquí irá el componente de Mapa ]</span>
            </Card.Body>
          </Card>
        </Col>
        {/* Contenido de Entregas Hoy y Alertas Activas */}
        <Col lg={4}>
          <Card className="mb-3 border-0 shadow-sm">
            <Card.Body>
              <h6 className="text-muted small">ENTREGAS HOY</h6>
              <h1 className="fw-bold">142</h1>
              <span className="text-success small">↑ +12% vs Ayer</span>
            </Card.Body>
          </Card>
          <Card className="border-0 shadow-sm border-start border-warning border-4">
            <Card.Body>
              <h6 className="text-muted small">ALERTAS ACTIVAS</h6>
              <h1 className="fw-bold text-warning">3</h1>
              <span className="text-muted small">Requieren atención inmediata</span>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabla de Próximos Envíos */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold">Próximos Envíos</h5>
          <Form.Control type="text" placeholder="Buscar ID..." style={{ width: '250px' }} />
        </Card.Header>
        <Card.Body>
          <Table hover responsive className="align-middle">
            <thead className="bg-light">
              <tr>
                <th>ID SEGUIMIENTO</th>
                <th>TRANSPORTISTA</th>
                <th>DESTINO</th>
                <th>T. ESTIMADO</th>
                <th>ESTADO</th>
                <th>ACCIÓN</th>
              </tr>
            </thead>
            <tbody>
              {DATOS_MOCK.map((envio) => (
                <tr key={envio.id}>
                  <td className="fw-bold">{envio.tracking}</td>
                  <td>{envio.driver}</td>
                  <td>{envio.destino}</td>
                  <td>{envio.tiempo}</td>
                  <td>
                    <Badge bg={envio.estado === 'En Tránsito' ? 'primary' : envio.estado === 'Pendiente' ? 'warning' : 'success'}>
                      {envio.estado}
                    </Badge>
                  </td>
                  <td><Button variant="link" className="p-0">Ver</Button></td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
}