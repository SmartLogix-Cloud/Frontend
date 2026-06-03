import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Nav, Navbar } from 'react-bootstrap';
// 1. Importamos el hook de enrutamiento
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  // 2. Inicializamos la función para navegar entre rutas
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombreCompleto: '',
    nombreEmpresa: '',
    correo: '',
    contrasena: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Datos enviados temporalmente:', formData);
    
    // 3. Redirección forzada e instantánea hacia el Layout interno del sistema
    navigate('/app');
  };

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: '#f8fafc', fontFamily: 'sans-serif' }}>
      
      {/* NAVBAR SUPERIOR */}
      <Navbar bg="white" className="px-4 border-bottom py-3">
        <Navbar.Brand className="fw-bold fs-4 text-dark" style={{ letterSpacing: '-0.5px' }}>
          SmartLogix
        </Navbar.Brand>
        <Nav className="ms-auto">
          <Nav.Link href="#support" className="text-secondary" style={{ fontSize: '14px' }}>Support</Nav.Link>
        </Nav>
      </Navbar>

      {/* SPLIT SCREEN */}
      <Container className="flex-grow-1 d-flex align-items-center justify-content-center py-5">
        <Row className="bg-white rounded-4 shadow-sm overflow-hidden w-100 g-0" style={{ maxWidth: '1100px', minHeight: '640px', border: '1px solid #e2e8f0' }}>
          
          {/* LADO IZQUIERDO: HERO */}
          <Col lg={6} className="d-none d-lg-flex p-5 text-white flex-column justify-content-end" style={{
            background: `linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.85)), url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>
            <div className="mb-4">
              <h1 className="fw-bold mb-3" style={{ fontSize: '36px', letterSpacing: '-0.5px' }}>
                Escalando el futuro de la logística.
              </h1>
              <p className="text-white-50 fs-6">
                Control total de inventario, envíos y análisis predictivo en una sola plataforma diseñada para el crecimiento de tu negocio.
              </p>
            </div>
            <div className="mt-4 bg-white bg-opacity-10 p-2 rounded-3 border border-white border-opacity-10" style={{ width: 'fit-content' }}>
              <span className="badge bg-success me-2">+500</span>
              <small className="text-white fw-semibold" style={{ fontSize: '11px' }}>PYMES CONFÍAN EN NOSOTROS</small>
            </div>
          </Col>

          {/* LADO DERECHO: FORMULARIO */}
          <Col lg={6} className="p-4 p-md-5 d-flex flex-column justify-content-center bg-white">
            <div className="mx-auto w-100" style={{ maxWidth: '420px' }}>
              
              <h2 className="fw-bold text-dark mb-1" style={{ fontSize: '28px', letterSpacing: '-0.5px' }}>Crea tu Cuenta</h2>
              <p className="text-muted mb-4" style={{ fontSize: '14px' }}>Únete a la plataforma de optimización logística para PYMEs</p>

              <Form onSubmit={handleSubmit}>
                
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold text-secondary mb-1" style={{ fontSize: '12px' }}>Nombre Completo</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="nombreCompleto"
                    placeholder="John Doe" 
                    value={formData.nombreCompleto}
                    onChange={handleChange}
                    className="py-2"
                    style={{ fontSize: '14px', backgroundColor: '#fcfdfe' }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold text-secondary mb-1" style={{ fontSize: '12px' }}>Nombre de la Empresa</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="nombreEmpresa"
                    placeholder="Logistics Corp S.A." 
                    value={formData.nombreEmpresa}
                    onChange={handleChange}
                    className="py-2"
                    style={{ fontSize: '14px', backgroundColor: '#fcfdfe' }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold text-secondary mb-1" style={{ fontSize: '12px' }}>Correo Electrónico Corporativo</Form.Label>
                  <Form.Control 
                    type="email" 
                    name="correo"
                    placeholder="nombre@empresa.com" 
                    value={formData.correo}
                    onChange={handleChange}
                    className="py-2"
                    style={{ fontSize: '14px', backgroundColor: '#fcfdfe' }}
                  />
                </Form.Group>

                <Form.Group className="mb-1">
                  <Form.Label className="fw-semibold text-secondary mb-1" style={{ fontSize: '12px' }}>Contraseña</Form.Label>
                  <Form.Control 
                    type="password" 
                    name="contrasena"
                    placeholder="••••••••" 
                    value={formData.contrasena}
                    onChange={handleChange}
                    className="py-2"
                    style={{ fontSize: '14px', backgroundColor: '#fcfdfe' }}
                  />
                  <Form.Text className="text-muted" style={{ fontSize: '11px' }}>
                    Mínimo 8 caracteres, incluyendo un número.
                  </Form.Text>
                </Form.Group>

                <Button type="submit" variant="dark" className="w-100 py-2 mt-4 fw-semibold" style={{ fontSize: '14px', backgroundColor: '#000000', borderRadius: '6px' }}>
                  Registrarse →
                </Button>
              </Form>

              <div className="text-center mt-4" style={{ fontSize: '13px' }}>
                <span className="text-muted">¿Ya tienes una cuenta? </span>
                <a href="/login" className="text-dark fw-bold text-decoration-none">Inicia sesión aquí</a>
              </div>

            </div>
          </Col>

        </Row>
      </Container>

      {/* FOOTER */}
      <footer className="bg-white border-top py-3 px-4 d-flex flex-column flex-md-row justify-content-between align-items-center" style={{ fontSize: '12px', color: '#64748b' }}>
        <div className="fw-bold text-dark mb-2 mb-md-0">SmartLogix</div>
        <div>© 2026 SmartLogix Logistics Solutions. All rights reserved.</div>
      </footer>

    </div>
  );
}