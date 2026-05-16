import { useMemo, useState } from 'react';
import { Row, Col, Card, Button, Table, Form, Badge, InputGroup, Spinner, Alert } from 'react-bootstrap';
import { useFetch } from '../client/useFetch.js';
import type { Pedido, EstadoPedido } from '../types/api.js';

const ESTADO_FILTROS: Array<EstadoPedido | 'TODOS'> = [
  'TODOS', 'PENDIENTE', 'APROBADO', 'EN_PREPARACION', 'ENVIADO', 'ENTREGADO', 'RECHAZADO', 'CANCELADO',
];

const ESTADO_LABEL: Record<EstadoPedido, string> = {
  PENDIENTE: 'Pendiente',
  APROBADO: 'Aprobado',
  EN_PREPARACION: 'En Preparación',
  ENVIADO: 'Enviado',
  ENTREGADO: 'Entregado',
  RECHAZADO: 'Rechazado',
  CANCELADO: 'Cancelado',
};

const ESTADO_BADGE: Record<EstadoPedido, { bg: string; fg: string }> = {
  PENDIENTE:      { bg: '#fff3cd', fg: '#664d03' },
  APROBADO:       { bg: '#d1e7dd', fg: '#0f5132' },
  EN_PREPARACION: { bg: '#cfe2ff', fg: '#084298' },
  ENVIADO:        { bg: '#cff4fc', fg: '#055160' },
  ENTREGADO:      { bg: '#d1e7dd', fg: '#0f5132' },
  RECHAZADO:      { bg: '#f8d7da', fg: '#842029' },
  CANCELADO:      { bg: '#e2e3e5', fg: '#41464b' },
};

function iniciales(idCliente: string): string {
  return idCliente.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase() || '??';
}

function formatFecha(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function formatMonto(n: number): string {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
}

export default function OrdenesPage() {
  const [estado, setEstado] = useState<EstadoPedido | 'TODOS'>('TODOS');
  const [busqueda, setBusqueda] = useState('');

  const path = estado === 'TODOS' ? '/pedidos' : `/pedidos?estado=${estado}`;
  const { reload, ...load } = useFetch<Pedido[]>(path);

  const filtrados = useMemo(() => {
    if (load.status !== 'ok') return [];
    const q = busqueda.trim().toLowerCase();
    if (!q) return load.data;
    return load.data.filter((p) =>
      p.codigo.toLowerCase().includes(q) ||
      p.idCliente.toLowerCase().includes(q),
    );
  }, [load, busqueda]);

  return (
    <div className="p-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Procesamiento de Pedidos</h2>
          <p className="text-muted mb-0">Gestiona y procesa las órdenes entrantes.</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={reload} disabled={load.status === 'loading'}>↻ Refrescar</Button>
          <Button variant="dark" className="px-4 py-2 shadow-sm">+ Nuevo Pedido</Button>
        </div>
      </div>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-4">
          <Row className="g-3 align-items-end">
            <Col md={3}>
              <Form.Label className="small fw-bold text-muted text-uppercase">Estado</Form.Label>
              <Form.Select
                className="bg-light border-0"
                value={estado}
                onChange={(e) => setEstado(e.target.value as EstadoPedido | 'TODOS')}
              >
                {ESTADO_FILTROS.map((s) => (
                  <option key={s} value={s}>
                    {s === 'TODOS' ? 'Todos los estados' : ESTADO_LABEL[s]}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={9}>
              <Form.Label className="small fw-bold text-muted text-uppercase">Buscar Cliente / Código</Form.Label>
              <InputGroup>
                <InputGroup.Text className="bg-light border-0 text-muted">🔍</InputGroup.Text>
                <Form.Control
                  placeholder="Ej: CL-001 o PED-20260513"
                  className="bg-light border-0"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {load.status === 'loading' && (
        <div className="d-flex justify-content-center py-5"><Spinner animation="border" /></div>
      )}

      {load.status === 'error' && (
        <Alert variant="danger" className="d-flex justify-content-between align-items-center">
          <div><strong>No se pudo cargar la lista.</strong> <small>{load.message}</small></div>
          <Button size="sm" variant="outline-danger" onClick={reload}>Reintentar</Button>
        </Alert>
      )}

      {load.status === 'ok' && (
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            <Table hover responsive className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4 py-3 text-muted small">ID PEDIDO</th>
                  <th className="py-3 text-muted small">CLIENTE</th>
                  <th className="py-3 text-muted small">FECHA</th>
                  <th className="py-3 text-muted small">MONTO</th>
                  <th className="py-3 text-muted small">ESTADO</th>
                  <th className="py-3 text-muted small text-end pe-4">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-muted py-4">Sin pedidos para el filtro actual.</td></tr>
                )}
                {filtrados.map((p) => {
                  const badge = ESTADO_BADGE[p.estado];
                  return (
                    <tr key={p.idPedido}>
                      <td className="ps-4 fw-bold">{p.codigo}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                            style={{ width: '32px', height: '32px', fontSize: '12px', backgroundColor: '#adb5bd' }}
                          >
                            {iniciales(p.idCliente)}
                          </div>
                          <span>{p.idCliente}</span>
                        </div>
                      </td>
                      <td className="text-muted small">{formatFecha(p.createdAt)}</td>
                      <td className="fw-bold">{formatMonto(p.total)}</td>
                      <td>
                        <Badge
                          pill
                          style={{ fontSize: '0.75rem', padding: '6px 12px', backgroundColor: badge.bg, color: badge.fg }}
                        >
                          {ESTADO_LABEL[p.estado]}
                        </Badge>
                      </td>
                      <td className="text-end pe-4">
                        <Button variant="link" className="text-muted p-0">⋮</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>

            <div className="d-flex justify-content-between align-items-center p-3 border-top">
              <span className="text-muted small">Mostrando {filtrados.length} de {load.data.length} pedidos</span>
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
