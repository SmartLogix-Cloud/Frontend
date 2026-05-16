import { Row, Col, Button, Table, Badge, Card, ButtonGroup } from 'react-bootstrap';

// Datos de prueba basados en tu imagen
const PRODUCTOS_MOCK = [
  { sku: 'PRD-001-X', nombre: 'Sensor de Proximidad V2', categoria: 'Componentes', ubicacion: 'Bodega Central (A-12)', stock: 1250, estado: 'Suficiente' },
  { sku: 'PRD-045-Y', nombre: 'Módulo de Control Principal', categoria: 'Ensamblajes', ubicacion: 'Bodega Norte (C-04)', stock: 42, estado: 'Bajo' },
  { sku: 'EMB-102-Z', nombre: 'Cajas de Cartón Corrugado XL', categoria: 'Embalaje', ubicacion: 'Bodega Sur (B-01)', stock: 0, estado: 'Sin Stock' },
  { sku: 'PRD-210-W', nombre: 'Cable de Red Cat6 (10m)', categoria: 'Componentes', ubicacion: 'Bodega Central (A-15)', stock: 850, estado: 'Suficiente' },
  { sku: 'PRD-088-A', nombre: 'Fuente de Poder 500W', categoria: 'Ensamblajes', ubicacion: 'Bodega Central (A-02)', stock: 15, estado: 'Bajo' },
];

export default function InventarioPage() {
  return (
    <div>
      {/* Encabezado */}
      <Row className="mb-4 align-items-center">
        <Col>
          <h2 className="fw-bold">Gestión de Inventario</h2>
          <p className="text-muted">Monitorea y administra el stock en todas las bodegas activas.</p>
        </Col>
        <Col xs="auto">
          <Button variant="dark" className="shadow-sm d-flex align-items-center gap-2">
             <i className="bi bi-arrow-repeat"></i> SINCRONIZAR BODEGAS
          </Button>
        </Col>
      </Row>

      {/* Filtros */}
      <Row className="mb-3 align-items-center">
        <Col>
          <span className="me-2 text-muted small fw-bold">FILTRAR POR:</span>
          <ButtonGroup size="sm">
            <Button variant="outline-primary" className="active">Todos</Button>
            <Button variant="outline-secondary">Componentes</Button>
            <Button variant="outline-secondary">Ensamblajes</Button>
            <Button variant="outline-secondary">Embalaje</Button>
          </ButtonGroup>
        </Col>
        <Col xs="auto">
          <Button variant="outline-secondary" size="sm">Más Filtros</Button>
        </Col>
      </Row>

      {/* Tabla de Productos */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <Table hover responsive className="mb-0 align-middle">
            <thead className="bg-light">
              <tr>
                <th className="ps-4 py-3 text-muted small">SKU</th>
                <th className="py-3 text-muted small">NOMBRE DEL PRODUCTO</th>
                <th className="py-3 text-muted small">CATEGORÍA</th>
                <th className="py-3 text-muted small">UBICACIÓN</th>
                <th className="py-3 text-muted small">STOCK</th>
                <th className="py-3 text-muted small text-center">ESTADO</th>
              </tr>
            </thead>
            <tbody>
              {PRODUCTOS_MOCK.map((prod, idx) => (
                <tr key={idx}>
                  <td className="ps-4 text-muted small">{prod.sku}</td>
                  <td className={prod.estado === 'Sin Stock' ? 'text-danger fw-bold' : 'fw-bold'}>
                    {prod.nombre}
                  </td>
                  <td>{prod.categoria}</td>
                  <td>{prod.ubicacion}</td>
                  <td className="fw-bold">{prod.stock.toLocaleString()}</td>
                  <td className="text-center">
                    <Badge 
                      pill 
                      bg={prod.estado === 'Suficiente' ? 'success-light' : prod.estado === 'Bajo' ? 'info-light' : 'danger-light'}
                      className={
                        prod.estado === 'Suficiente' ? 'text-success' : 
                        prod.estado === 'Bajo' ? 'text-primary' : 'text-danger'
                      }
                      style={{ 
                        backgroundColor: 
                          prod.estado === 'Suficiente' ? '#d1e7dd' : 
                          prod.estado === 'Bajo' ? '#cfe2ff' : '#f8d7da' 
                      }}
                    >
                      ● {prod.estado}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          
          {/* Paginación simple abajo */}
          <div className="d-flex justify-content-between align-items-center p-3 border-top">
            <span className="text-muted small">Mostrando 1 a 5 de 248 productos</span>
            <ButtonGroup size="sm">
              <Button variant="outline-secondary">&lt;</Button>
              <Button variant="dark">1</Button>
              <Button variant="outline-secondary">2</Button>
              <Button variant="outline-secondary">3</Button>
              <Button variant="outline-secondary">...</Button>
              <Button variant="outline-secondary">&gt;</Button>
            </ButtonGroup>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}