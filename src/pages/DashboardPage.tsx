import { Row, Col, Card, Button, ListGroup } from 'react-bootstrap';

export default function DashboardPage() {
  const stats = [
    { title: 'TOTAL ÓRDENES', val: '1,248', sub: '↑ +12% vs ayer', color: 'primary', icon: '🛒' },
    { title: 'STOCK BAJO', val: '34', sub: 'Acción requerida', color: 'warning', icon: '⚠️' },
    { title: 'EN TRÁNSITO', val: '892', sub: 'Esperado hoy: 145', color: 'info', icon: '🚚' },
    { title: 'VAL. PENDIENTE', val: '56', sub: 'Cola de revisión', color: 'danger', icon: '📝' },
  ];

  return (
    <div className="p-2">
      <header className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Panel de Control</h2>
          <p className="text-muted">Resumen de tus operaciones logísticas para hoy.</p>
        </div>
        <Button variant="dark" className="px-4 py-2 shadow-sm">+ Crear Envío</Button>
      </header>

      {/* Tarjetas de Métricas */}
      <Row className="g-4 mb-4">
        {stats.map((s, idx) => (
          <Col key={idx} md={3}>
            <Card className="border-0 shadow-sm p-2 h-100">
              <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                  <h6 className="text-muted small fw-bold">{s.title}</h6>
                  <span className={`badge bg-${s.color}-subtle text-${s.color} rounded-circle`}>{s.icon}</span>
                </div>
                <h3 className="fw-bold mb-1">{s.val}</h3>
                <small className={idx === 0 ? 'text-success fw-bold' : 'text-muted'}>{s.sub}</small>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-4">
        {/* Gráfico (Simulado) */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">Actividad de Ventas Semanal</h5>
              <Button variant="link" className="text-muted p-0 text-decoration-none">⋮</Button>
            </Card.Header>
            <Card.Body className="d-flex align-items-end justify-content-around pb-4" style={{ minHeight: '300px' }}>
              {/* Esto simula las barras del gráfico de tu foto */}
              {[40, 60, 30, 80, 55, 25, 45].map((h, i) => (
                <div 
                  key={i} 
                  className="bg-dark rounded-top shadow-sm" 
                  style={{ width: '40px', height: `${h}%`, opacity: 0.8, transition: 'height 0.3s' }}
                  title={`Día ${i+1}: ${h}%`}
                ></div>
              ))}
            </Card.Body>
          </Card>
        </Col>

        {/* Actividad Reciente */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between">
              <h5 className="fw-bold mb-0">Actividad Reciente</h5>
              <small className="text-primary fw-bold">Bodega A</small>
            </Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item className="border-0 py-3">
                <div className="d-flex gap-3">
                  <div className="text-success fs-5">✔</div>
                  <div>
                    <div className="fw-bold small">Envío #ORD-992 Despachado</div>
                    <div className="text-muted small">Palet A4 cargado en el Camión 04.</div>
                    <div className="text-muted extra-small mt-1" style={{ fontSize: '0.75rem' }}>Hace 10 min</div>
                  </div>
                </div>
              </ListGroup.Item>
              <ListGroup.Item className="border-0 py-3">
                <div className="d-flex gap-3">
                  <div className="text-warning fs-5">⚠️</div>
                  <div>
                    <div className="fw-bold small">Alerta Stock Bajo: SK-X19</div>
                    <div className="text-muted small">Sujetadores industriales por debajo del umbral.</div>
                    <div className="text-muted extra-small mt-1" style={{ fontSize: '0.75rem' }}>Hace 45 min</div>
                  </div>
                </div>
              </ListGroup.Item>
              <ListGroup.Item className="border-0 py-3">
                <div className="d-flex gap-3">
                  <div className="text-primary fs-5">👤</div>
                  <div>
                    <div className="fw-bold small">Nueva Cuenta Registrada</div>
                    <div className="text-muted small">Global Tech Supplies Inc. incorporado.</div>
                    <div className="text-muted extra-small mt-1" style={{ fontSize: '0.75rem' }}>Hace 2 horas</div>
                  </div>
                </div>
              </ListGroup.Item>
              <Button variant="link" className="text-center text-decoration-none py-3 border-top text-primary fw-bold">
                Ver Todos los Registros
              </Button>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </div>
  );
}