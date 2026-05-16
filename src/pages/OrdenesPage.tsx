import { Row, Col, Card, Button, Table, Form, Badge, InputGroup } from 'react-bootstrap';

// Datos de ejemplo basados en tu imagen
const ORDENES_MOCK = [
  { id: '#ORD-9081', cliente: 'María Rodríguez', iniciales: 'MR', fecha: '24 Oct, 10:45 AM', monto: '$1,250.00', estado: 'Pendiente' },
  { id: '#ORD-9080', cliente: 'Carlos López', iniciales: 'CL', fecha: '24 Oct, 09:15 AM', monto: '$845.50', estado: 'En Preparación' },
  { id: '#ORD-9079', cliente: 'Empresa Logística S.A.', iniciales: 'EL', fecha: '23 Oct, 16:30 PM', monto: '$4,320.00', estado: 'Aprobado' },
  { id: '#ORD-9078', cliente: 'Ana Gómez', iniciales: 'AG', fecha: '23 Oct, 14:10 PM', monto: '$150.00', estado: 'Pendiente' },
];

export default function OrdenesPage() {
  return (
    <div className="p-2">
      {/* Encabezado */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Procesamiento de Pedidos</h2>
          <p className="text-muted">Gestiona y procesa las órdenes entrantes.</p>
        </div>
        <Button variant="dark" className="px-4 py-2 shadow-sm">
          + Nuevo Pedido
        </Button>
      </div>

      {/* Barra de Filtros */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-4">
          <Row className="g-3 align-items-end">
            <Col md={3}>
              <Form.Label className="small fw-bold text-muted text-uppercase">Estado</Form.Label>
              <Form.Select className="bg-light border-0">
                <option>Todos los estados</option>
                <option>Pendiente</option>
                <option>En Preparación</option>
                <option>Aprobado</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label className="small fw-bold text-muted text-uppercase">Fecha</Form.Label>
              <Form.Control type="date" className="bg-light border-0" />
            </Col>
            <Col md={6}>
              <Form.Label className="small fw-bold text-muted text-uppercase">Buscar Cliente / ID</Form.Label>
              <InputGroup>
                <InputGroup.Text className="bg-light border-0 text-muted">🔍</InputGroup.Text>
                <Form.Control 
                  placeholder="Ej: Juan Pérez o #ORD-123" 
                  className="bg-light border-0"
                />
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabla de Pedidos */}
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
              {ORDENES_MOCK.map((orden, idx) => (
                <tr key={idx}>
                  <td className="ps-4 fw-bold">{orden.id}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                        style={{ width: '32px', height: '32px', fontSize: '12px', backgroundColor: '#adb5bd' }}
                      >
                        {orden.iniciales}
                      </div>
                      <span>{orden.cliente}</span>
                    </div>
                  </td>
                  <td className="text-muted small">{orden.fecha}</td>
                  <td className="fw-bold">{orden.monto}</td>
                  <td>
                    <Badge 
                      pill 
                      style={{ 
                        fontSize: '0.75rem',
                        padding: '6px 12px',
                        backgroundColor: 
                          orden.estado === 'Aprobado' ? '#d1e7dd' : 
                          orden.estado === 'Pendiente' ? '#fff3cd' : '#cfe2ff',
                        color: 
                          orden.estado === 'Aprobado' ? '#0f5132' : 
                          orden.estado === 'Pendiente' ? '#664d03' : '#084298'
                      }}
                    >
                      {orden.estado}
                    </Badge>
                  </td>
                  <td className="text-end pe-4">
                    <Button variant="link" className="text-muted p-0">⋮</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          
          {/* Paginación */}
          <div className="d-flex justify-content-between align-items-center p-3 border-top">
            <span className="text-muted small">Mostrando 1 a 4 de 24 pedidos</span>
            <div className="d-flex gap-2">
              <Button variant="outline-secondary" size="sm" className="px-3">Anterior</Button>
              <Button variant="outline-dark" size="sm" className="px-3">Siguiente</Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}