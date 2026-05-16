import { useMemo, useState } from 'react';
import { Row, Col, Button, Table, Badge, Card, ButtonGroup, Spinner, Alert, Form } from 'react-bootstrap';
import { useFetch } from '../client/useFetch.js';
import type { Producto, Stock } from '../types/api.js';

type EstadoVisible = 'Suficiente' | 'Bajo' | 'Sin Stock' | 'Sin datos';

function estadoVisible(stocks: Stock[] | undefined): EstadoVisible {
  if (!stocks || stocks.length === 0) return 'Sin datos';
  const total = stocks.reduce((acc, s) => acc + s.disponible, 0);
  const minimo = stocks.reduce((acc, s) => acc + s.stockMinimo, 0);
  if (total === 0) return 'Sin Stock';
  if (minimo > 0 && total < minimo) return 'Bajo';
  return 'Suficiente';
}

function estadoBadgeStyle(estado: EstadoVisible): { bg: string; color: string } {
  switch (estado) {
    case 'Suficiente': return { bg: '#d1e7dd', color: '#0f5132' };
    case 'Bajo':       return { bg: '#cfe2ff', color: '#084298' };
    case 'Sin Stock':  return { bg: '#f8d7da', color: '#842029' };
    case 'Sin datos':  return { bg: '#e2e3e5', color: '#41464b' };
  }
}

export default function InventarioPage() {
  const [busqueda, setBusqueda] = useState('');
  const [soloActivos, setSoloActivos] = useState(false);

  // Cargo productos + stockBajo en paralelo. stockBajo permite resaltar items criticos
  // sin tener que consultar /stock/producto/{id} N veces.
  const productos = useFetch<Producto[]>('/inventario/productos');
  const stockBajo = useFetch<Stock[]>('/inventario/stock/bajo');

  const stockBajoPorProducto = useMemo(() => {
    if (stockBajo.status !== 'ok') return new Map<number, Stock[]>();
    const m = new Map<number, Stock[]>();
    for (const s of stockBajo.data) {
      const arr = m.get(s.idProducto) ?? [];
      arr.push(s);
      m.set(s.idProducto, arr);
    }
    return m;
  }, [stockBajo]);

  const filas = useMemo(() => {
    if (productos.status !== 'ok') return [];
    const q = busqueda.trim().toLowerCase();
    return productos.data
      .filter((p) => (soloActivos ? p.activo : true))
      .filter((p) =>
        !q
          ? true
          : p.sku.toLowerCase().includes(q) || p.nombre.toLowerCase().includes(q),
      )
      .map((p) => {
        const stocks = stockBajoPorProducto.get(p.idProducto);
        const estado = estadoVisible(stocks);
        const disponibleTotal = stocks?.reduce((acc, s) => acc + s.disponible, 0);
        return { producto: p, estado, disponibleTotal };
      });
  }, [productos, stockBajoPorProducto, busqueda, soloActivos]);

  const loading = productos.status === 'loading' || stockBajo.status === 'loading';
  const error = productos.status === 'error'
    ? productos.message
    : stockBajo.status === 'error'
      ? stockBajo.message
      : null;

  const reloadTodo = () => { productos.reload(); stockBajo.reload(); };

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col>
          <h2 className="fw-bold">Gestión de Inventario</h2>
          <p className="text-muted mb-0">Monitorea y administra el stock en todas las bodegas activas.</p>
        </Col>
        <Col xs="auto">
          <Button variant="outline-secondary" onClick={reloadTodo} disabled={loading} className="me-2">↻ Refrescar</Button>
          <Button variant="dark" className="shadow-sm">+ Nuevo Producto</Button>
        </Col>
      </Row>

      <Row className="mb-3 align-items-end g-3">
        <Col md={6}>
          <Form.Label className="small fw-bold text-muted text-uppercase">Buscar</Form.Label>
          <Form.Control
            type="text"
            placeholder="SKU o nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </Col>
        <Col md="auto">
          <Form.Check
            type="switch"
            id="solo-activos"
            label="Solo activos"
            checked={soloActivos}
            onChange={(e) => setSoloActivos(e.target.checked)}
          />
        </Col>
      </Row>

      {loading && <div className="d-flex justify-content-center py-5"><Spinner animation="border" /></div>}

      {error && (
        <Alert variant="danger" className="d-flex justify-content-between align-items-center">
          <div><strong>No se pudo cargar el inventario.</strong> <small>{error}</small></div>
          <Button size="sm" variant="outline-danger" onClick={reloadTodo}>Reintentar</Button>
        </Alert>
      )}

      {productos.status === 'ok' && stockBajo.status === 'ok' && (
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            <Table hover responsive className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4 py-3 text-muted small">SKU</th>
                  <th className="py-3 text-muted small">NOMBRE DEL PRODUCTO</th>
                  <th className="py-3 text-muted small">DESCRIPCIÓN</th>
                  <th className="py-3 text-muted small text-end">PRECIO</th>
                  <th className="py-3 text-muted small text-end">DISP. TOTAL</th>
                  <th className="py-3 text-muted small text-center">ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {filas.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-muted py-4">Sin productos para mostrar.</td></tr>
                )}
                {filas.map(({ producto, estado, disponibleTotal }) => {
                  const style = estadoBadgeStyle(estado);
                  return (
                    <tr key={producto.idProducto}>
                      <td className="ps-4 text-muted small">{producto.sku}</td>
                      <td className={estado === 'Sin Stock' ? 'text-danger fw-bold' : 'fw-bold'}>
                        {producto.nombre}
                      </td>
                      <td className="text-muted small">{producto.descripcion ?? '—'}</td>
                      <td className="text-end fw-bold">
                        {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(producto.precio)}
                      </td>
                      <td className="text-end fw-bold">
                        {disponibleTotal === undefined ? <span className="text-muted">—</span> : disponibleTotal.toLocaleString('es-CL')}
                      </td>
                      <td className="text-center">
                        <Badge pill style={{ backgroundColor: style.bg, color: style.color }}>● {estado}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>

            <div className="d-flex justify-content-between align-items-center p-3 border-top">
              <span className="text-muted small">Mostrando {filas.length} de {productos.data.length} productos</span>
              <ButtonGroup size="sm">
                <Button variant="outline-secondary" disabled>&lt;</Button>
                <Button variant="dark">1</Button>
                <Button variant="outline-secondary" disabled>&gt;</Button>
              </ButtonGroup>
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
