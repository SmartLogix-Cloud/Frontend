import { useEffect, useState } from 'react';
import { Row, Col, Card, Button, ListGroup, Spinner, Alert } from 'react-bootstrap';
import { apiClient, ApiError } from '../client/apiClient.js';
import type { DashboardResponse, EstadoPedido } from '../types/api.js';

type LoadState =
  | { status: 'loading' }
  | { status: 'ok'; data: DashboardResponse }
  | { status: 'error'; message: string };

const ESTADOS_PEDIDO_VISIBLES: EstadoPedido[] = [
  'PENDIENTE', 'APROBADO', 'EN_PREPARACION', 'ENVIADO', 'ENTREGADO',
];

function totalPedidos(pedidos: DashboardResponse['pedidos']): number {
  return ESTADOS_PEDIDO_VISIBLES.reduce((acc, estado) => {
    const n = pedidos[estado];
    return acc + (typeof n === 'number' ? n : 0);
  }, 0);
}

function formatHora(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
}

export default function DashboardPage() {
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading' });
    apiClient.get<DashboardResponse>('/dashboard', { signal: controller.signal })
      .then((data) => setState({ status: 'ok', data }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const message = err instanceof ApiError
          ? `${err.status} — ${err.message}`
          : (err as Error).message;
        setState({ status: 'error', message });
      });
    return () => controller.abort();
  }, [reloadKey]);

  const refresh = () => setReloadKey((k) => k + 1);

  return (
    <div className="p-2">
      <header className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Panel de Control</h2>
          <p className="text-muted mb-0">Resumen de tus operaciones logísticas para hoy.</p>
          {state.status === 'ok' && (
            <small className="text-muted">Actualizado {formatHora(state.data.generatedAt)}</small>
          )}
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={refresh} disabled={state.status === 'loading'}>
            ↻ Refrescar
          </Button>
          <Button variant="dark" className="px-4 py-2 shadow-sm">+ Crear Envío</Button>
        </div>
      </header>

      {state.status === 'loading' && (
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" role="status" />
        </div>
      )}

      {state.status === 'error' && (
        <Alert variant="danger" className="d-flex justify-content-between align-items-center">
          <div>
            <Alert.Heading className="h6 mb-1">No se pudo cargar el dashboard</Alert.Heading>
            <small>{state.message}</small>
          </div>
          <Button size="sm" variant="outline-danger" onClick={refresh}>Reintentar</Button>
        </Alert>
      )}

      {state.status === 'ok' && <DashboardContent data={state.data} />}
    </div>
  );
}

function DashboardContent({ data }: { data: DashboardResponse }) {
  const stats = [
    {
      title: 'TOTAL ÓRDENES',
      val: totalPedidos(data.pedidos).toLocaleString('es-CL'),
      sub: 'Todos los estados activos',
      color: 'primary',
      icon: '🛒',
    },
    {
      title: 'STOCK BAJO',
      val: data.stockBajo.total.toString(),
      sub: data.stockBajo.total > 0 ? 'Acción requerida' : 'Sin alertas',
      color: 'warning',
      icon: '⚠️',
    },
    {
      title: 'EN TRÁNSITO',
      val: data.enviosEnRuta.total.toString(),
      sub: data.enviosEnRuta.total > 0 ? 'Despachados activos' : 'Sin envíos en ruta',
      color: 'info',
      icon: '🚚',
    },
    {
      title: 'VAL. PENDIENTE',
      val: (data.pedidos.PENDIENTE ?? 0).toString(),
      sub: 'Cola de aprobación',
      color: 'danger',
      icon: '📝',
    },
  ];

  return (
    <>
      <Row className="g-4 mb-4">
        {stats.map((s, idx) => (
          <Col key={s.title} md={3}>
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
        <Col lg={8}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold mb-0">Pedidos por estado</h5>
                <small className="text-muted">Distribución actual del pipeline</small>
              </div>
              <small className="text-muted">Total: {totalPedidos(data.pedidos)}</small>
            </Card.Header>
            <Card.Body className="d-flex align-items-end justify-content-around pb-4" style={{ minHeight: '300px' }}>
              <PedidosBars pedidos={data.pedidos} />
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="fw-bold mb-0">Actividad Reciente</h5>
              <small className="text-muted">Alertas de stock y envíos en ruta</small>
            </Card.Header>
            <ListGroup variant="flush">
              <ActivityFeed data={data} />
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  );
}

function PedidosBars({ pedidos }: { pedidos: DashboardResponse['pedidos'] }) {
  const valores = ESTADOS_PEDIDO_VISIBLES.map((estado) => ({
    estado,
    n: typeof pedidos[estado] === 'number' ? (pedidos[estado] as number) : 0,
  }));
  const max = Math.max(1, ...valores.map((v) => v.n));

  return (
    <>
      {valores.map(({ estado, n }) => {
        const h = max > 0 ? Math.max(8, (n / max) * 90) : 8;
        return (
          <div key={estado} className="d-flex flex-column align-items-center" style={{ flex: 1 }}>
            <small className="text-muted fw-bold mb-1">{n}</small>
            <div
              className="bg-dark rounded-top shadow-sm"
              style={{ width: '40px', height: `${h}%`, opacity: 0.8, transition: 'height 0.3s', minHeight: '8px' }}
              title={`${estado}: ${n}`}
            />
            <small className="text-muted mt-2" style={{ fontSize: '0.7rem' }}>{estado}</small>
          </div>
        );
      })}
    </>
  );
}

function ActivityFeed({ data }: { data: DashboardResponse }) {
  const items: Array<{ key: string; icon: string; iconClass: string; title: string; detail: string }> = [];

  for (const envio of data.enviosEnRuta.items.slice(0, 3)) {
    items.push({
      key: `envio-${envio.idEnvio}`,
      icon: '🚚',
      iconClass: 'text-success',
      title: `Envío ${envio.trackingNumber} en ruta`,
      detail: `${envio.direccionDestino}${envio.comuna ? `, ${envio.comuna}` : ''}`,
    });
  }

  for (const stock of data.stockBajo.items.slice(0, 3)) {
    items.push({
      key: `stock-${stock.idStock}`,
      icon: '⚠️',
      iconClass: 'text-warning',
      title: `Stock bajo: ${stock.sku}`,
      detail: `${stock.bodega} — disponible ${stock.disponible}, mínimo ${stock.stockMinimo}`,
    });
  }

  if (items.length === 0) {
    return (
      <ListGroup.Item className="border-0 py-4 text-center text-muted">
        Sin alertas ni envíos activos en este momento.
      </ListGroup.Item>
    );
  }

  return (
    <>
      {items.map((it) => (
        <ListGroup.Item key={it.key} className="border-0 py-3">
          <div className="d-flex gap-3">
            <div className={`${it.iconClass} fs-5`}>{it.icon}</div>
            <div>
              <div className="fw-bold small">{it.title}</div>
              <div className="text-muted small">{it.detail}</div>
            </div>
          </div>
        </ListGroup.Item>
      ))}
    </>
  );
}
