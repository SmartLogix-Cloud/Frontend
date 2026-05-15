// src/components/Layout.tsx
import { Container, Row, Col } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar'; // Al estar en la misma carpeta, solo es './'

export default function Layout() {
  return (
    <Container fluid className="p-0" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Row className="g-0">
        <Col xs={2} className="bg-dark text-white shadow" style={{ minHeight: '100vh', position: 'sticky', top: 0 }}>
          <Sidebar />
        </Col>
        <Col xs={10} className="p-4">
          <Outlet /> 
        </Col>
      </Row>
    </Container>
  );
}