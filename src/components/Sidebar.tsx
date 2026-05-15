import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Inicio', icon: '🏠' }, // Ahora Inicio es el raíz
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/inventario', label: 'Inventario', icon: '📦' },
    { path: '/ordenes', label: 'Pedidos', icon: '🛒' },
    { path: '/envios', label: 'Coordinación de Envíos', icon: '🚚' }, // Envíos ahora tiene su ruta
  ];

  return (
    <div className="d-flex flex-column p-3 h-100 shadow text-white bg-dark">
      <div className="px-3 py-2 mb-4">
        <h3 className="fw-bold m-0">SMARTLOGIX</h3>
        <small className="text-secondary">Enterprise Logistics</small>
      </div>
      <Nav className="flex-column gap-1">
        {navItems.map((item) => (
          <Nav.Link 
            key={item.path}
            as={Link} to={item.path} 
            className={`py-3 px-3 rounded d-flex align-items-center gap-3 ${
              location.pathname === item.path ? 'bg-primary text-white shadow' : 'text-secondary bg-transparent'
            }`}
          >
            <span>{item.icon}</span> {item.label}
          </Nav.Link>
        ))}
      </Nav>
      
      <div className="mt-auto border-top border-secondary pt-3">
        <Nav.Link as={Link} to="/config" className="text-secondary small">⚙️ Configuraciones</Nav.Link>
        <Nav.Link as={Link} to="/soporte" className="text-secondary small">❓ Soporte</Nav.Link>
      </div>
    </div>
  );
}