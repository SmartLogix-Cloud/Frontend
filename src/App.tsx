import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  Product,
  Shipment,
  LogisticsLog,
  ShipmentDto,
  ShipmentTrackingDto,
  ShipmentStatus,
  LogType,
  Order,
  OrderStatus
} from './types';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import DashboardHome from './pages/DashboardHome';
import WarehouseGrid from './pages/WarehouseGrid';
import ShipmentTable from './pages/ShipmentTable';
import AIHub from './pages/AIHub';
import { OrdersView } from './pages/OrdersView'; // 1. Importamos la vista de órdenes
import { INITIAL_LOGS } from './data/mockData';
import {
  api,
  getStoredToken,
  getUserProfileFromToken,
  removeStoredToken,
  getErrorMessage,
} from './client/apiClient';

// Datos de prueba mockeados para OrdersView hasta conectar el endpoint de pedidos
const INITIAL_ORDERS: Order[] = [
  {
    id: '#ORD-9821',
    client: { name: 'Comercializadora del Sur', company: 'Comercializadora S.A.', initials: 'CS' },
    date: '23 Oct, 2026',
    dateRaw: '2026-10-23',
    amount: 1450000.00,
    status: 'Pendiente'
  },
  {
    id: '#ORD-9822',
    client: { name: 'Distribuidora Central', company: 'Distribuidora Central SpA', initials: 'DC' },
    date: '22 Oct, 2026',
    dateRaw: '2026-10-22',
    amount: 890500.50,
    status: 'Aprobado'
  },
  {
    id: '#ORD-9823',
    client: { name: 'Logística Express CL', company: 'Logística Express', initials: 'LE' },
    date: '21 Oct, 2026',
    dateRaw: '2026-10-21',
    amount: 3200000.00,
    status: 'En Preparación'
  },
  {
    id: '#ORD-9824',
    client: { name: 'Retail del Norte', company: 'Retail Norte Ltda.', initials: 'RN' },
    date: '20 Oct, 2026',
    dateRaw: '2026-10-20',
    amount: 650000.00,
    status: 'Enviado'
  }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  
  // 2. Extendemos currentTab para incluir 'orders'
  const [currentTab, setCurrentTab] = useState<'overview' | 'warehouse' | 'shipments' | 'orders' | 'ai-hub'>('overview');

  // Operational states
  const [products, setProducts] = useState<Product[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [logs, setLogs] = useState<LogisticsLog[]>(INITIAL_LOGS);

  const mapEstado = (e: string): ShipmentStatus => {
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

  const mapDtoToShipment = (d: ShipmentDto): Shipment => {
    return {
      id: String(d.shipmentId ?? d.id ?? Math.random().toString(36).substring(7)),
      trackingNumber: d.trackingNumber ?? `ENV-${Math.floor(Math.random()*1e6)}`,
      origin: d.district ? `${d.district}${d.region ? ', ' + d.region : ''}` : 'Planta Central',
      destination: d.destinationAddress ?? d.destination ?? '',
      carrier: d.carrierName ?? 'Pendiente',
      status: mapEstado(d.status),
      estimatedDelivery: d.estimatedDate ? String(d.estimatedDate) : '',
      itemsCount: d.itemsCount ?? 1,
      weight: d.weight ?? 0,
      priority: d.priority ?? 'Media',
      timeline: (d.tracking ?? []).map((s: ShipmentTrackingDto) => ({
        status: `Estatus: ${mapEstado(s.status ?? '')}`,
        location: s.location ?? '',
        timestamp: s.createdAt ? new Date(s.createdAt).toISOString().substring(0,16).replace('T',' ') : '',
        description: s.comment ?? ''
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
      const mapped = (rawShipments || []).map((d) => mapDtoToShipment(d));
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

  const appendLog = (type: LogType, message: string, operator: string) => {
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
    } catch (err) {
      alert("Error al ingresar producto: " + getErrorMessage(err));
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
    } catch (err) {
      alert("Error al actualizar stock: " + getErrorMessage(err));
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const targetProd = products.find(p => p.id === id);
    if (!targetProd) return;

    try {
      await api.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      appendLog('system_info', `Lote removido: Se desactivó el lote ${targetProd.sku} (${targetProd.name}) de los racks RFID.`, currentUser?.name || 'Operador');
    } catch (err) {
      alert("Error al desactivar producto: " + getErrorMessage(err));
    }
  };

  // Shipment actions
  const handleAddShipment = (newShip: Shipment) => {
    setShipments(prev => [newShip, ...prev]);
    appendLog('shipment_update', `Nueva orden de despacho generada: ${newShip.trackingNumber} (${newShip.origin} ➔ ${newShip.destination}) via ${newShip.carrier}.`, currentUser?.name || 'Operador');
  };

  const handleUpdateShipmentStatus = (id: string, nextStatus: ShipmentStatus) => {
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

  // 3. Handlers para las acciones del módulo de Pedidos (OrdersView)
  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    appendLog('system_info', `Orden ${orderId} modificada a estado: ${status}.`, currentUser?.name || 'Operador');
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    appendLog('system_info', `Orden ${orderId} fue cancelada y removida del panel.`, currentUser?.name || 'Operador');
  };

  // Switch tab helper
  const handleNavigateToTab = (tab: 'overview' | 'warehouse' | 'shipments' | 'orders' | 'ai-hub') => {
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
            setCurrentTab={setCurrentTab as any} 
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

            {currentTab === 'orders' && (
              <OrdersView 
                orders={orders}
                onOpenNewOrderModal={() => alert("Modal para generar nuevo pedido")}
                onOpenOrderDetails={(order) => alert(`Ficha completa de la orden: ${order.id}`)}
                onOpenValidateModal={(order) => handleUpdateOrderStatus(order.id, 'Aprobado')}
                onOpenAssignWarehouseModal={(order) => handleUpdateOrderStatus(order.id, 'En Preparación')}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onDeleteOrder={handleDeleteOrder}
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