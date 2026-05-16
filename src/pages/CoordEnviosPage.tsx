import { useMemo, useState } from 'react';
import { Row, Col, Card, Button, Table, Badge, Form, Spinner, Alert } from 'react-bootstrap';
import { useFetch } from '../client/useFetch.js';
import type { Envio, EstadoEnvio } from '../types/api.js';

const ESTADO_LABEL: Record<EstadoEnvio, string> = {
  CREADO:     'Creado',
  ASIGNADO:   'Asignado',
  EN_RUTA:    'En Ruta',
  ENTREGADO:  'Entregado',
  INCIDENCIA: 'Incidencia',
};

const ESTADO_VARIANT: Record<EstadoEnvio, string> = {
  CREADO:     'secondary',
  ASIGNADO:   'info',
  EN_RUTA:    'primary',
  ENTREGADO:  'success',
  INCIDENCIA: 'warning',
};

function formatFechaCorta(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function esHoy(iso: string | null): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear()
    && d.getMonth() === now.getMonth()
    && d.getDate() === now.getDate();
}

export default function CoordEnviosPage() {
  const [busqueda, setBusqueda] = useState('');
  const { reload, ...load } = useFetch<Envio[]>('/envios');

  const stats = useMemo(() => {
    if (load.status !== 'ok') return { entregasHoy: 0, alertas: 0, enRuta: 0 };
    let entregasHoy = 0;
    let alertas = 0;
    let enRuta = 0;
    for (const e of load.data) {
      if (e.estado === 'ENTREGADO' && esHoy(e.fechaEntrega)) entregasHoy++;
      if (e.estado === 'INCIDENCIA') alertas++;
      if (e.estado === 'EN_RUTA') enRuta++;
    }
    return { entregasHoy, alertas, enRuta };
  }, [load]);

  const proximosEnvios = useMemo(() => {
    if (load.status !== 'ok') return [];
    const activos = load.data.filter((e) => e.estado !== 'ENTREGADO');
    const q = busqueda.trim().toLowerCase();
    if (!q) return activos;
    return activos.filter((e) =>
      e.trackingNumber.toLowerCase().includes(q) ||
      (e.transportistaNombre ?? '').toLowerCase().includes(q),
    );
  }, [load, busqueda]);

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col>
          <h2 className="fw-bold">Coordinación de Envíos</h2>
          <p className="text-muted mb-0">Gestione rutas, supervise transportistas y optimice entregas en tiempo real.</p>
        </Col>
        <Col xs="auto">
          <Button variant="outline-secondary" onClick={reload} disabled={load.status === 'loading'} className="me-2">↻ Refrescar</Button>
          <Button variant="dark" className="me-2 shadow-sm">+ Planificar Nueva Ruta</Button>
          <Button variant="success" className="shadow-sm">Comunicación</Button>
        </Col>
      </Row>

      {load.status === 'loading' && (
        <div className="d-flex justify-content-center py-5"><Spinner animation="border" /></div>
      )}

      {load.status === 'error' && (
        <Alert variant="danger" className="d-flex justify-content-between align-items-center">
          <div><strong>No se pudieron cargar los envíos.</strong> <small>{load.message}</small></div>
          <Button size="sm" variant="outline-danger" onClick={reload}>Reintentar</Button>
        </Alert>
      )}

      {load.status === 'ok' && (
        <>
          <Row className="mb-4">
            <Col lg={8}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white py-3"><strong>Rutas Activas</strong></Card.Header>
                <Card.Body className="d-flex align-items-center justify-content-center bg-light" style={{ minHeight: '260px' }}>
                  <div className="text-center text-muted">
                    <div className="fs-1 mb-2">🗺️</div>
                    <small>{stats.enRuta > 0
                      ? `${stats.enRuta} envío${stats.enRuta === 1 ? '' : 's'} en ruta ahora mismo`
                      : 'Sin envíos en ruta actualmente'}</small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4}>
              <Card className="mb-3 border-0 shadow-sm">
                <Card.Body>
                  <h6 className="text-muted small">ENTREGAS HOY</h6>
                  <h1 className="fw-bold">{stats.entregasHoy}</h1>
                  <span className="text-muted small">Envíos entregados en las últimas 24 h</span>
                </Card.Body>
              </Card>
              <Card className={`border-0 shadow-sm border-start ${stats.alertas > 0 ? 'border-warning' : 'border-success'} border-4`}>
                <Card.Body>
                  <h6 className="text-muted small">ALERTAS ACTIVAS</h6>
                  <h1 className={`fw-bold ${stats.alertas > 0 ? 'text-warning' : 'text-success'}`}>{stats.alertas}</h1>
                  <span className="text-muted small">{stats.alertas > 0 ? 'Envíos con incidencia' : 'Sin incidencias'}</span>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">Próximos Envíos</h5>
              <Form.Control
                type="text"
                placeholder="Buscar tracking o transportista..."
                style={{ width: '300px' }}
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </Card.Header>
            <Card.Body>
              <Table hover responsive className="align-middle">
                <thead className="bg-light">
                  <tr>
                    <th>TRACKING</th>
                    <th>TRANSPORTISTA</th>
                    <th>DESTINO</th>
                    <th>F. ESTIMADA</th>
                    <th>ESTADO</th>
                    <th>ACCIÓN</th>
                  </tr>
                </thead>
                <tbody>
                  {proximosEnvios.length === 0 && (
                    <tr><td colSpan={6} className="text-center text-muted py-4">Sin envíos activos.</td></tr>
                  )}
                  {proximosEnvios.map((e) => (
                    <tr key={e.idEnvio}>
                      <td className="fw-bold">{e.trackingNumber}</td>
                      <td>{e.transportistaNombre ?? <span className="text-muted small">— sin asignar —</span>}</td>
                      <td>{e.direccionDestino}{e.comuna ? `, ${e.comuna}` : ''}</td>
                      <td>{formatFechaCorta(e.fechaEstimada)}</td>
                      <td><Badge bg={ESTADO_VARIANT[e.estado]}>{ESTADO_LABEL[e.estado]}</Badge></td>
                      <td><Button variant="link" className="p-0">Ver</Button></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
}
