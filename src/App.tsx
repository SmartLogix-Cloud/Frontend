import React, { useState, useEffect } from 'react';
import { UserProfile, Product, Shipment, LogisticsLog } from './types';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import DashboardHome from './pages/DashboardHome';
import WarehouseGrid from './pages/WarehouseGrid';
import ShipmentTable from './pages/ShipmentTable';
import AIHub from './pages/AIHub';
import { INITIAL_LOGS } from './data/mockData';
import { api, getStoredToken, getUserProfileFromToken, removeStoredToken } from './client/apiClient';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentTab, setCurrentTab] = useState<'overview' | 'warehouse' | 'shipments' | 'ai-hub'>('overview');

  // Operational states
  const [products, setProducts] = useState<Product[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [logs, setLogs] = useState<LogisticsLog[]>(INITIAL_LOGS);

  const mapEstado = (e: string) => {
    if (!e) return 'Pendiente';
    switch (e) {
      case 'ENTREGADO': return 'Entregado';
      case 'EN_RUTA': return 'En Tránsito';
      case 'ASIGNADO': return 'Pendiente';
      case 'CREADO': return 'Pendiente';
      case 'INCIDENCIA': return 'Retrasado';
      default: return 'Pendiente';
    }
  };

  const mapDtoToShipment = (d: any): Shipment => {
    return {
      id: String(d.idEnvio ?? d.id ?? d.id_envio ?? Math.random().toString(36).substring(7)),
      trackingNumber: d.trackingNumber ?? d.tracking_number ?? `ENV-${Math.floor(Math.random()*1e6)}`,
      origin: d.comuna ? `${d.comuna}${d.region ? ', ' + d.region : ''}` : 'Planta Central',
      destination: d.direccionDestino ?? d.direccion_destino ?? d.destination ?? '',
      carrier: d.transportistaNombre ?? d.transportista?.nombre ?? 'Pendiente',
      status: mapEstado(d.estado ?? d.estadoEnvio),
      estimatedDelivery: d.fechaEstimada ? (typeof d.fechaEstimada === 'string' ? d.fechaEstimada : d.fechaEstimada.toString()) : (d.fecha_estimada ?? ''),
      itemsCount: d.itemsCount ?? 1,
      weight: d.weight ?? 0,
      priority: d.priority ?? 'Media',
      timeline: (d.seguimiento ?? d.tracking ?? []).map((s: any) => ({
        status: `Estatus: ${mapEstado(s.estado)}`,
        location: s.ubicacion ?? '',
        timestamp: s.createdAt ? new Date(s.createdAt).toISOString().substring(0,16).replace('T',' ') : (s.created_at ? new Date(s.created_at).toISOString().substring(0,16).replace('T',' ') : ''),
        description: s.comentario ?? ''
      }))
    };
  };

  // Load backend data
  const loadData = async () => {
    try {
      const prods = await api.getProducts();
      setProducts(prods);
    } catch (err) {
      console.error("Error loading products:", err);
    }

    try {
      const rawShipments = await api.getShipments();
      const mapped = (rawShipments || []).map((d: any) => mapDtoToShipment(d));
      setShipments(mapped);
    } catch (err) {
      console.error("Error loading shipments:", err);
    }
  };

  // Restore session on mount
  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      const user = getUserProfileFromToken(token);
      if (user) {
        setCurrentUser(user);
        loadData();
      } else {
        removeStoredToken();
      }
    }
  }, []);

  // Core functions
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    loadData();
    appendLog('security_event', `Acceso exitoso al panel de control por el usuario ${user.email}.`, user.name);
  };

  const handleLogout = () => {
    if (currentUser) {
      appendLog('security_event', `Sesión finalizada de forma segura por ${currentUser.name}.`, 'Sistema');
    }
    removeStoredToken();
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

  function getWarehouseId(location: string): number {
    const loc = (location || "").toLowerCase();
    if (loc.includes("fría") || loc.includes("fria") || loc.includes("b3")) return 2;
    if (loc.includes("carga") || loc.includes("general") || loc.includes("o1")) return 3;
    if (loc.includes("expresa") || loc.includes("sur")) return 4;
    return 1;
  }

  // Product actions
  const handleAddProduct = async (newProd: Product) => {
    try {
      const created = await api.createProduct(newProd);
      setProducts(prev => [created, ...prev]);
      appendLog('system_info', `Se ingresó y ubicó el lote ${created.sku} (${created.name}) en ${created.location}.`, currentUser?.name || 'Operador');
    } catch (err: any) {
      alert("Error al ingresar producto: " + err.message);
    }
  };

  const handleUpdateProductStock = async (id: string, newQty: number) => {
    const p = products.find(prod => prod.id === id);
    if (!p) return;
    const delta = newQty - p.quantity;
    if (delta === 0) return;

    try {
      const warehouseId = getWarehouseId(p.location);
      await api.adjustProductStock(p.id, warehouseId, delta, delta > 0 ? 'ENTRADA' : 'SALIDA');
      
      const nextStatus = newQty <= 0 ? 'Agotado' : newQty <= p.minStock ? 'Bajo Stock' : 'Disponible';
      let logMsg = `Lote ${p.sku} stock modificado de ${p.quantity}u. a ${newQty}u. Ubicación: ${p.location}.`;
      if (nextStatus === 'Bajo Stock') logMsg += ' [ALERTA BAJO STOCK]';
      
      appendLog(nextStatus === 'Bajo Stock' ? 'inventory_alert' : 'system_info', logMsg, currentUser?.name || 'Operador');

      setProducts(prev => prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            quantity: newQty,
            status: nextStatus,
            lastUpdated: new Date().toISOString().substring(0, 10)
          };
        }
        return item;
      }));
    } catch (err: any) {
      alert("Error al actualizar stock: " + err.message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const targetProd = products.find(p => p.id === id);
    if (!targetProd) return;

    try {
      await api.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      appendLog('system_info', `Lote removido: Se desactivó el lote ${targetProd.sku} (${targetProd.name}) de los racks RFID.`, currentUser?.name || 'Operador');
    } catch (err: any) {
      alert("Error al desactivar producto: " + err.message);
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
              <ShipmentTable 
                shipments={shipments}
                onAddShipment={handleAddShipment}
                onUpdateShipmentStatus={handleUpdateShipmentStatus}
              />
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
