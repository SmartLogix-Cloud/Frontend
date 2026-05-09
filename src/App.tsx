import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout'; 
import EnviosDashboard from './pages/CoordEnviosPage'; 

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<EnviosDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}