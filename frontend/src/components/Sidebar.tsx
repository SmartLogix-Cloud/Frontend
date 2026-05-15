import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation(); // Esto sirve para saber en qué página estamos

  return (
    <div className="d-flex flex-column p-3 h-100 shadow">
      <h3 className="text-white mb-4 mt-2 px-3 fw-bold">SMARTLOGIX</h3>
      <hr className="text-secondary" />
      <Nav className="flex-column mt-3">
        {/* Usamos as={Link} para que no recargue la página completa */}
        <Nav.Link 
          as={Link} to="/dashboard" 
          className={location.pathname === '/dashboard' ? 'text-white bg-primary rounded shadow py-3 px-3' : 'text-secondary py-3 px-3'}
        >
          Dashboard
        </Nav.Link>

        <Nav.Link 
          as={Link} to="/inventario" 
          className={location.pathname === '/inventario' ? 'text-white bg-primary rounded shadow py-3 px-3' : 'text-secondary py-3 px-3'}
        >
          Inventario
        </Nav.Link>

        <Nav.Link 
          as={Link} to="/ordenes" 
          className={location.pathname === '/ordenes' ? 'text-white bg-primary rounded shadow py-3 px-3' : 'text-secondary py-3 px-3'}
        >
          Ordenes
        </Nav.Link>

        <Nav.Link 
          as={Link} to="/" 
          className={location.pathname === '/' ? 'text-white bg-primary rounded shadow py-3 px-3' : 'text-secondary py-3 px-3'}
        >
          Envios
        </Nav.Link>
      </Nav>
      
      <div className="mt-auto">
        <Nav.Link as={Link} to="/config" className="text-secondary py-2 px-3 small">Configuraciones</Nav.Link>
        <Nav.Link as={Link} to="/soporte" className="text-secondary py-2 px-3 small">Soporte</Nav.Link>
      </div>
    </div>
  );
}