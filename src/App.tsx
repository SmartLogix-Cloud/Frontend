import React, { useState } from 'react';
import { UserProfile, Product, Shipment, LogisticsLog } from './types';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import DashboardHome from './pages/DashboardHome';
import WarehouseGrid from './pages/WarehouseGrid';
import ShipmentTable from './pages/ShipmentTable';
import AIHub from './pages/AIHub';
import { INITIAL_PRODUCTS, INITIAL_SHIPMENTS, INITIAL_LOGS } from './data/mockData';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentTab, setCurrentTab] = useState<'overview' | 'warehouse' | 'shipments' | 'ai-hub'>('overview');

  // Operational states
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [shipments, setShipments] = useState<Shipment[]>(INITIAL_SHIPMENTS);
  const [logs, setLogs] = useState<LogisticsLog[]>(INITIAL_LOGS);

  // Core functions
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    // Add login log
    appendLog('security_event', `Acceso exitoso al panel de control por el usuario ${user.email}.`, user.name);
  };

  const handleLogout = () => {
    if (currentUser) {
      appendLog('security_event', `Sesión finalizada de forma segura por ${currentUser.name}.`, 'Sistema');
    }
    setCurrentUser(null);
    setCurrentTab('overview');
  };

  const appendLog = (type: 'shipment_update' | 'inventory_alert' | 'system_info' | 'security_event', message: string, operator: string) => {
    const newLog: LogisticsLog = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString().substring(0, 16).replace('T', ' '),
      type,
      message,
      operator
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Product actions
  const handleAddProduct = (newProd: Product) => {
    setProducts(prev => [newProd, ...prev]);
    appendLog('system_info', `Se ingresó y ubicó el lote ${newProd.sku} (${newProd.name}) en ${newProd.location}.`, currentUser?.name || 'Operador');
  };

  const handleUpdateProductStock = (id: string, newQty: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const nextStatus = newQty <= 0 ? 'Agotado' : newQty <= p.minStock ? 'Bajo Stock' : 'Disponible';
        
        let logMsg = `Lote ${p.sku} stock modificado de ${p.quantity}u. a ${newQty}u. Ubicación: ${p.location}.`;
        if (nextStatus === 'Bajo Stock') logMsg += ' [ALERTA BAJO STOCK]';
        
        appendLog(nextStatus === 'Bajo Stock' ? 'inventory_alert' : 'system_info', logMsg, currentUser?.name || 'Operador');

        return {
          ...p,
          quantity: newQty,
          status: nextStatus,
          lastUpdated: new Date().toISOString().substring(0, 10)
        };
      }
      return p;
    }));
  };

  const handleDeleteProduct = (id: string) => {
    const targetProd = products.find(p => p.id === id);
    setProducts(prev => prev.filter(p => p.id !== id));
    if (targetProd) {
      appendLog('system_info', `Lote removido: Se eliminó el lote ${targetProd.sku} (${targetProd.name}) de los racks RFID.`, currentUser?.name || 'Operador');
    }
  };

  // Shipment actions
  const handleAddShipment = (newShip: Shipment) => {
    setShipments(prev => [newShip, ...prev]);
    appendLog('shipment_update', `Nueva orden de despacho generada: ${newShip.trackingNumber} (${newShip.origin} ➔ ${newShip.destination}) via ${newShip.carrier}.`, currentUser?.name || 'Operador');
  };

  const handleUpdateShipmentStatus = (id: string, nextStatus: 'Entregado' | 'En Tránsito' | 'Pendiente' | 'Retrasado') => {
    setShipments(prev => prev.map(s => {
      if (s.id === id) {
        appendLog('shipment_update', `Carga ${s.trackingNumber} cambió estatus de "${s.status}" a "${nextStatus}". Operador satélite asignado.`, currentUser?.name || 'Operador');
        return {
          ...s,
          status: nextStatus
        };
      }
      return s;
    }));
  };

  // Switch tab helper
  const handleNavigateToTab = (tab: 'overview' | 'warehouse' | 'shipments' | 'ai-hub') => {
    setCurrentTab(tab);
  };

  return (
    <div className="w-full min-h-screen text-[#0b1c30]">
      
      {/* Visual rendering condition */}
      {currentUser === null ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div className="flex w-full min-h-screen bg-slate-50">
          
          {/* Main lateral fixed navigation panel */}
          <Sidebar 
            currentTab={currentTab} 
            setCurrentTab={setCurrentTab} 
            user={currentUser} 
            onLogout={handleLogout} 
          />

          {/* Main Workspace Frame container */}
          <main className="flex-1 p-6 md:p-8 xl:p-10 max-w-7xl mx-auto overflow-y-auto space-y-6">
            
            {/* View modules */}
            {currentTab === 'overview' && (
              <DashboardHome 
                user={currentUser} 
                shipments={shipments} 
                logs={logs} 
                onNavigateToTab={handleNavigateToTab} 
              />
            )}

            {currentTab === 'warehouse' && (
              <WarehouseGrid 
                products={products}
                onAddProduct={handleAddProduct}
                onUpdateProductStock={handleUpdateProductStock}
                onDeleteProduct={handleDeleteProduct}
              />
            )}

            {currentTab === 'shipments' && (
              <ShipmentTable />
            )}

            {currentTab === 'ai-hub' && (
              <AIHub 
                shipments={shipments}
                products={products}
                onLogMessage={(type, msg) => appendLog(type, msg, 'Logix-AI Scout')}
              />
            )}

          </main>

        </div>
      )}

    </div>
  );
}
