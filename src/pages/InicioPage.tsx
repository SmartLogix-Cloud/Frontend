import { Row, Col, Card, Badge, Button, ListGroup } from 'react-bootstrap';

export default function InicioPage() {
  return (
    <div className="p-2">
      {/* Saludo y Estados */}
      <div className="mb-4">
        <h2 className="fw-bold">¡Bienvenido de nuevo, Carlos!</h2>
        <div className="d-flex gap-2 mt-2">
          <Badge bg="success-light" className="text-success border border-success-subtle px-3 py-2">● Sistemas operativos</Badge>
          <Badge bg="warning-light" className="text-warning border border-warning-subtle px-3 py-2">📋 3 Pedidos pendientes</Badge>
          <Badge bg="info-light" className="text-primary border border-primary-subtle px-3 py-2">🚚 12 En tránsito</Badge>
        </div>
      </div>

      {/* Accesos Rápidos */}
      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm bg-dark text-white p-3 h-100">
            <Card.Body>
              <div className="mb-3 fs-4">➕</div>
              <h5 className="fw-bold">Crear Nuevo Pedido</h5>
              <p className="small text-secondary">Iniciar flujo de despacho B2B</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm p-3 h-100">
            <Card.Body>
              <div className="text-primary mb-3 fs-4">📦</div>
              <h5 className="fw-bold">Ver Inventario</h5>
              <p className="small text-muted">Auditoría y control de stock</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm p-3 h-100">
            <Card.Body>
              <div className="text-info mb-3 fs-4">🗺️</div>
              <h5 className="fw-bold">Gestionar Envíos</h5>
              <p className="small text-muted">Rutas y operadores logísticos</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        {/* Productos en Catálogo */}
        <Col lg={8}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold m-0">Productos en Catálogo</h5>
            <Button variant="link" className="text-success text-decoration-none fw-bold small">VER TODOS</Button>
          </div>
          <Row className="g-3">
            <Col md={6}>
              <Card className="border-0 shadow-sm overflow-hidden">
                <div style={{ height: '160px', backgroundColor: '#f0f2f5' }} className="d-flex align-items-center justify-content-center">
                  <span className="text-muted small">Servidor Rack Enterprise V4</span>
                  <Badge bg="dark" className="position-absolute top-0 end-0 m-2">42 UND</Badge>
                </div>
                <Card.Body>
                  <small className="text-muted d-block">SKU: SVR-992X</small>
                  <h6 className="fw-bold">Servidor Rack Enterprise V4</h6>
                  <small className="text-muted">Insumos Operativos</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="border-0 shadow-sm overflow-hidden">
                <div style={{ height: '160px', backgroundColor: '#f0f2f5' }} className="d-flex align-items-center justify-content-center">
                  <span className="text-muted small">Caja Logística Reforzada L</span>
                  <Badge bg="warning" className="text-dark position-absolute top-0 end-0 m-2">12 UND</Badge>
                </div>
                <Card.Body>
                  <small className="text-muted d-block">SKU: BX-L09A</small>
                  <h6 className="fw-bold">Caja Logística Reforzada L</h6>
                  <small className="text-muted">Insumos Operativos</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Próximas Tareas */}
        <Col lg={4}>
          <h5 className="fw-bold mb-3">Próximas Tareas</h5>
          <ListGroup variant="flush" className="shadow-sm rounded">
            <ListGroup.Item className="p-3 border-0">
              <div className="d-flex gap-3">
                <div className="bg-danger-subtle text-danger p-2 rounded h-100">⚠️</div>
                <div>
                  <div className="fw-bold small">Stock crítico detectado</div>
                  <p className="x-small text-muted m-0" style={{ fontSize: '0.8rem' }}>SKU: SVR-100Z tiene menos de 5 unidades.</p>
                  <small className="text-muted italic" style={{ fontSize: '0.7rem' }}>Hace 15 min</small>
                </div>
              </div>
            </ListGroup.Item>
            <ListGroup.Item className="p-3 border-0">
              <div className="d-flex gap-3">
                <div className="bg-primary-subtle text-primary p-2 rounded h-100">🚚</div>
                <div>
                  <div className="fw-bold small">Autorizar ruta norte</div>
                  <p className="x-small text-muted m-0" style={{ fontSize: '0.8rem' }}>El convoy 42 espera aprobación.</p>
                  <small className="text-muted italic" style={{ fontSize: '0.7rem' }}>Hace 2 horas</small>
                </div>
              </div>
            </ListGroup.Item>
          </ListGroup>
        </Col>
      </Row>
    </div>
  );
}