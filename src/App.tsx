import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout'; 
import InicioPage from './pages/InicioPage'; 
import DashboardPage from './pages/DashboardPage';
import InventarioPage from './pages/InventarioPage';
import OrdenesPage from './pages/OrdenesPage';
import CoordEnviosPage from './pages/CoordEnviosPage'; 
import RegistroPage from './pages/RegistroPage'; // Importamos tu nueva página

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Al abrir la app, lo PRIMERO que se verá es el Registro sin menús */}
        <Route path="/" element={<RegistroPage />} />
        <Route path="/registro" element={<RegistroPage />} />

        {/* 2. El resto de las páginas internas envueltas en tu Layout */}
        <Route path="/app" element={<Layout />}>
          <Route index element={<InicioPage />} />
          <Route path="envios" element={<CoordEnviosPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="inventario" element={<InventarioPage />} />
          <Route path="ordenes" element={<OrdenesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}