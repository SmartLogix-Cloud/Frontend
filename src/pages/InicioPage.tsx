import { Row, Col, Card, Badge, Button, ListGroup, Spinner, Alert } from 'react-bootstrap';
import { useFetch } from '../client/useFetch.js';
import type { DashboardResponse, Producto } from '../types/api.js';

function formatHora(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const diffMin = Math.max(0, Math.round((Date.now() - d.getTime()) / 60000));
  if (diffMin < 1) return 'recién';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const h = Math.round(diffMin / 60);
  return `Hace ${h} h`;
}

export default function InicioPage() {
  const dashboard = useFetch<DashboardResponse>('/dashboard');
  const productos = useFetch<Producto[]>('/inventario/productos');

  const pendientes = dashboard.status === 'ok' ? (dashboard.data.pedidos.PENDIENTE ?? 0) : null;
  const enRuta = dashboard.status === 'ok' ? dashboard.data.enviosEnRuta.total : null;
  const stockBajo = dashboard.status === 'ok' ? dashboard.data.stockBajo.total : null;

  const productosTop = productos.status === 'ok' ? productos.data.slice(0, 4) : [];

  return (
    <div className="p-2">
      <div className="mb-4">
        <h2 className="fw-bold">¡Bienvenido de nuevo!</h2>
        <div className="d-flex gap-2 mt-2 flex-wrap">
          <Badge bg="success-light" className="text-success border border-success-subtle px-3 py-2">● Sistemas operativos</Badge>
          {pendientes !== null && (
            <Badge bg="warning-light" className="text-warning border border-warning-subtle px-3 py-2">
              📋 {pendientes} {pendientes === 1 ? 'pedido pendiente' : 'pedidos pendientes'}
            </Badge>
          )}
          {enRuta !== null && (
            <Badge bg="info-light" className="text-primary border border-primary-subtle px-3 py-2">
              🚚 {enRuta} en tránsito
            </Badge>
          )}
          {stockBajo !== null && stockBajo > 0 && (
            <Badge bg="danger-light" className="text-danger border border-danger-subtle px-3 py-2">
              ⚠️ {stockBajo} con stock bajo
            </Badge>
          )}
          {dashboard.status === 'error' && (
            <Badge bg="danger-light" className="text-danger border border-danger-subtle px-3 py-2">
              ⚠ BFF no disponible
            </Badge>
          )}
        </div>
      </div>

      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm bg-dark text-white p-3 h-100">
            <Card.Body>
              <div className="mb-3 fs-4">➕</div>
              <h5 className="fw-bold">Crear Nuevo Pedido</h5>
              <p className="small text-secondary mb-0">Iniciar flujo de despacho B2B</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm p-3 h-100">
            <Card.Body>
              <div className="text-primary mb-3 fs-4">📦</div>
              <h5 className="fw-bold">Ver Inventario</h5>
              <p className="small text-muted mb-0">Auditoría y control de stock</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm p-3 h-100">
            <Card.Body>
              <div className="text-info mb-3 fs-4">🗺️</div>
              <h5 className="fw-bold">Gestionar Envíos</h5>
              <p className="small text-muted mb-0">Rutas y operadores logísticos</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={8}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold m-0">Productos en Catálogo</h5>
            <Button variant="link" className="text-success text-decoration-none fw-bold small">VER TODOS</Button>
          </div>
          {productos.status === 'loading' && <div className="d-flex justify-content-center py-4"><Spinner animation="border" size="sm" /></div>}
          {productos.status === 'error' && (
            <Alert variant="danger" className="small"><strong>Catálogo no disponible.</strong> {productos.message}</Alert>
          )}
          {productos.status === 'ok' && productosTop.length === 0 && (
            <Alert variant="secondary" className="small">No hay productos cargados todavía.</Alert>
          )}
          {productos.status === 'ok' && productosTop.length > 0 && (
            <Row className="g-3">
              {productosTop.map((p) => (
                <Col md={6} key={p.idProducto}>
                  <Card className="border-0 shadow-sm overflow-hidden h-100">
                    <div style={{ height: '120px', backgroundColor: '#f0f2f5' }} className="d-flex align-items-center justify-content-center position-relative">
                      <span className="text-muted small">{p.nombre}</span>
                      <Badge bg={p.activo ? 'dark' : 'secondary'} className="position-absolute top-0 end-0 m-2">
                        {p.activo ? 'ACTIVO' : 'INACTIVO'}
                      </Badge>
                    </div>
                    <Card.Body>
                      <small className="text-muted d-block">SKU: {p.sku}</small>
                      <h6 className="fw-bold mb-1">{p.nombre}</h6>
                      <small className="text-muted">
                        {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(p.precio)}
                      </small>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Col>

        <Col lg={4}>
          <h5 className="fw-bold mb-3">Próximas Tareas</h5>
          {dashboard.status === 'loading' && <div className="d-flex justify-content-center py-4"><Spinner animation="border" size="sm" /></div>}
          {dashboard.status === 'error' && (
            <Alert variant="danger" className="small"><strong>BFF no disponible.</strong> {dashboard.message}</Alert>
          )}
          {dashboard.status === 'ok' && <ProximasTareas data={dashboard.data} />}
        </Col>
      </Row>
    </div>
  );
}

function ProximasTareas({ data }: { data: DashboardResponse }) {
  const items: Array<{ key: string; icon: string; iconClass: string; title: string; detail: string; when: string }> = [];

  for (const s of data.stockBajo.items.slice(0, 3)) {
    items.push({
      key: `stock-${s.idStock}`,
      icon: '⚠️',
      iconClass: 'bg-danger-subtle text-danger',
      title: `Stock crítico: ${s.sku}`,
      detail: `${s.bodega} — disponible ${s.disponible}, mínimo ${s.stockMinimo}`,
      when: formatHora(s.updatedAt),
    });
  }
  for (const e of data.enviosEnRuta.items.slice(0, 3)) {
    items.push({
      key: `envio-${e.idEnvio}`,
      icon: '🚚',
      iconClass: 'bg-primary-subtle text-primary',
      title: `Envío ${e.trackingNumber} en ruta`,
      detail: `${e.direccionDestino}${e.comuna ? `, ${e.comuna}` : ''}`,
      when: formatHora(e.updatedAt),
    });
  }

  if (items.length === 0) {
    return (
      <Alert variant="success" className="small mb-0">
        Sin alertas ni envíos activos. Todo bajo control.
      </Alert>
    );
  }

  return (
    <ListGroup variant="flush" className="shadow-sm rounded">
      {items.map((it) => (
        <ListGroup.Item key={it.key} className="p-3 border-0">
          <div className="d-flex gap-3">
            <div className={`${it.iconClass} p-2 rounded h-100`}>{it.icon}</div>
            <div>
              <div className="fw-bold small">{it.title}</div>
              <p className="text-muted m-0" style={{ fontSize: '0.8rem' }}>{it.detail}</p>
              <small className="text-muted" style={{ fontSize: '0.7rem' }}>{it.when}</small>
            </div>
          </div>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
}
