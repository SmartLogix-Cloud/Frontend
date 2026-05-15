import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout'; 
import InicioPage from './pages/InicioPage'; 
import DashboardPage from './pages/DashboardPage';
import InventarioPage from './pages/InventarioPage';
// OJO: Según tu carpeta, el archivo se llama EnviosDashboard.tsx
import CoordEnviosPage from './pages/CoordEnviosPage'; 

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* 1. Al abrir la app, se verá Inicio */}
          <Route index element={<InicioPage />} />
          
          {/* 2. La ruta /envios ahora abrirá tu panel de rutas */}
          <Route path="envios" element={<CoordEnviosPage />} />
          
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="inventario" element={<InventarioPage />} />
          
          {/* Si aún no haces Ordenes, déjala con este texto para que no falle */}
          <Route path="ordenes" element={<h2 className="p-4">Página de Pedidos en construcción</h2>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}