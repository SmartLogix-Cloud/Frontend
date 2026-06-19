import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Plus, 
  MapPin, 
  Truck, 
  ChevronRight, 
  X,
  Gauge,
  ArrowRight
} from 'lucide-react';
import { Shipment } from '../types';
import { api } from '../client/apiClient';

interface ShipmentTableProps {
  // Optional: component will fetch from BFF if no shipments are provided
  shipments?: Shipment[];
  onAddShipment?: (shipment: Shipment) => void;
  onUpdateShipmentStatus?: (id: string, nextStatus: 'Entregado' | 'En Tránsito' | 'Pendiente' | 'Retrasado') => void;
}

export default function ShipmentTable({ shipments, onAddShipment, onUpdateShipmentStatus }: ShipmentTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [priorityFilter, setPriorityFilter] = useState<string>('Todos');
  
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  
  // Create Shipment states
  const [isCreating, setIsCreating] = useState(false);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [carrier, setCarrier] = useState('DHS Express');
  const [priority, setPriority] = useState<'Alta' | 'Media' | 'Baja'>('Media');
  const [weight, setWeight] = useState(150);
  const [itemsCount, setItemsCount] = useState(5);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Local shipments state when fetched from backend
  const [remoteShipments, setRemoteShipments] = useState<Shipment[] | null>(null);

  // API base (Vite env or default to localhost:3000 where BFF runs)
  const API_BASE = (import.meta as any).env.VITE_API_BASE || 'http://localhost:3000';

  // Sorter
  const [sortBy, setSortBy] = useState<'estimatedDelivery' | 'weight' | 'trackingNumber'>('estimatedDelivery');

  const sourceShipments = remoteShipments ?? shipments ?? [];

  const filteredShipments = sourceShipments.filter(s => {
    const matchesSearch = s.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.carrier.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'Todos' || s.status === statusFilter;
    const matchesPriority = priorityFilter === 'Todos' || s.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  }).sort((a, b) => {
    if (sortBy === 'estimatedDelivery') {
      return new Date(a.estimatedDelivery).getTime() - new Date(b.estimatedDelivery).getTime();
    }
    if (sortBy === 'weight') {
      return b.weight - a.weight;
    }
    return a.trackingNumber.localeCompare(b.trackingNumber);
  });

  // Map backend DTO -> frontend Shipment (hoisted as function declaration so can be used above)
  function mapDtoToShipment(d: any): Shipment {
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
      timeline: (d.tracking ?? []).map((s: any) => ({
        status: `Estatus: ${mapEstado(s.status)}`,
        location: s.location ?? '',
        timestamp: s.createdAt ? new Date(s.createdAt).toISOString().substring(0,16).replace('T',' ') : '',
        description: s.comment ?? ''
      }))
    } as Shipment;
  }

  const handleCreateShipment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!origin || !destination) {
      setErrorMsg('Debes especificar Origen y Destino para calcular la ruta.');
      return;
    }

    const trackingNum = `SL-${Math.floor(100000 + Math.random() * 900000)}`;
    const randomHours = Math.floor(24 + Math.random() * 72);
    const estDeliveryDate = new Date();
    estDeliveryDate.setHours(estDeliveryDate.getHours() + randomHours);

    const newShip: Shipment = {
      id: Math.random().toString(36).substring(7),
      trackingNumber: trackingNum,
      origin,
      destination,
      carrier,
      status: 'Pendiente',
      estimatedDelivery: estDeliveryDate.toISOString().substring(0, 10),
      itemsCount: Number(itemsCount),
      weight: Number(weight),
      priority,
      timeline: [
        {
          status: 'Orden Creada',
          location: origin,
          timestamp: new Date().toISOString().substring(0, 16).replace('T', ' '),
          description: 'Se ha registrado la orden de despacho en el muelle de carga.'
        }
      ]
    };

    // Try to POST to BFF if available; otherwise call provided callback
    (async () => {
      try {
        const payload = {
          orderId: 1, // default logical ID
          carrierId: 1, // default carrier ID
          destinationAddress: destination,
          estimatedDate: new Date().toISOString().substring(0,10),
        };

        const created = await api.createShipment(payload);
        const mapped: Shipment = mapDtoToShipment(created);
        setRemoteShipments(prev => prev ? [mapped, ...prev] : [mapped]);
        onAddShipment?.(mapped);
      } catch (err) {
        onAddShipment?.(newShip);
      }
    })();
    setIsCreating(false);
    
    // Clear
    setOrigin('');
    setDestination('');
    setCarrier('DHS Express');
    setPriority('Media');
    setWeight(150);
    setItemsCount(5);
  };

  const handleUpdateStatusLocal = (status: 'Entregado' | 'En Tránsito' | 'Pendiente' | 'Retrasado') => {
    if (!selectedShipment) return;
    onUpdateShipmentStatus?.(selectedShipment.id, status);

    // Map to backend enum and call BFF
    const mapToEnum = (s: string) => {
      switch (s) {
        case 'Entregado': return 'ENTREGADO';
        case 'En Tránsito': return 'EN_RUTA';
        case 'Retrasado': return 'INCIDENCIA';
        case 'Pendiente':
        default:
          return 'CREADO';
      }
    };

    (async () => {
      try {
        const body = {
          status: mapToEnum(status),
          location: status === 'Entregado' ? selectedShipment.destination : 'Centro de Distribución Intermedio',
          comment: `Actualizado manualmente a ${status}`,
        };

        const updated = await api.updateShipmentStatus(selectedShipment.id, body);
        const mapped = mapDtoToShipment(updated);
        setRemoteShipments(prev => prev ? prev.map(p => p.id === mapped.id ? mapped : p) : [mapped]);
        setSelectedShipment(mapped);
      } catch (err) {
        applyLocalStatusUpdate(status);
      }
    })();
  };

  const applyLocalStatusUpdate = (status: 'Entregado' | 'En Tránsito' | 'Pendiente' | 'Retrasado') => {
    setSelectedShipment(prev => {
      if (!prev) return null;
      const newTimelineNode = {
        status: `Estatus: ${status}`,
        location: status === 'Entregado' ? prev.destination : 'Centro de Distribución Intermedio',
        timestamp: new Date().toISOString().substring(0, 16).replace('T', ' '),
        description: `Se actualizó el estado a ${status} por control operativo.`
      };

      const updated = { ...prev, status, timeline: [newTimelineNode, ...prev.timeline] };
      setRemoteShipments(prevList => prevList ? prevList.map(p => p.id === updated.id ? updated : p) : [updated]);
      return updated;
    });
  };

  

  // Fetch shipments from BFF on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await api.getShipments();
        if (!mounted) return;
        const mapped = (data || []).map((d: any) => mapDtoToShipment(d));
        setRemoteShipments(mapped);
      } catch (err) {
        // ignore — keep using props or empty
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false };
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Top Header Board */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#006a61]">SEGUIMIENTO DE ENVÍOS</span>
          <h2 className="text-xl font-extrabold text-[#0b1c30] mt-0.5">Control de Despacho y Órdenes</h2>
          <p className="text-slate-500 text-xs mt-0.5">Monitorea transportistas externos, fechas de entrega, prioridades operativas de carga y timelines de transito.</p>
        </div>
        
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-1.5 px-4 py-2 bg-black hover:bg-slate-900 text-white rounded-lg text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>Generar Envío Nuevo</span>
        </button>
      </div>

      {/* Interactive Order Creator */}
      {isCreating && (
        <form onSubmit={handleCreateShipment} className="bg-white p-6 rounded-xl border border-slate-200 shadow-md space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Truck size={16} className="text-[#006a61]" />
              Formulario de Despacho (Nueva Orden SL)
            </h3>
            <button 
              type="button" 
              onClick={() => setIsCreating(false)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 text-rose-800 text-xs font-bold rounded-lg">{errorMsg}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Origin */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">ORIGEN</label>
              <input 
                type="text"
                placeholder="ej. Santiago de Chile, CL"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#006a61]/10 focus:border-[#006a61] outline-none"
              />
            </div>

            {/* Destination */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">DESTINO</label>
              <input 
                type="text"
                placeholder="ej. Lima, PE"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#006a61]/10 focus:border-[#006a61] outline-none"
              />
            </div>

            {/* Carrier */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">TRANSPORTISTA EXTRICTO</label>
              <select
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                className="w-full px-2 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#006a61]/10 focus:border-[#006a61] outline-none bg-white font-semibold"
              >
                <option value="DHS Express">DHS Express Corporation</option>
                <option value="FedLogix International">FedLogix International</option>
                <option value="SmartFreight CL">SmartFreight CL</option>
                <option value="CargoNorte S.A.">CargoNorte S.A.</option>
              </select>
            </div>

            {/* Weight */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">PESO TOTAL (KG)</label>
              <input 
                type="number"
                min="1"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#006a61]/10 focus:border-[#006a61] outline-none"
              />
            </div>

            {/* Items count */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">CANTIDAD DE BULTOS / PALLETS</label>
              <input 
                type="number"
                min="1"
                value={itemsCount}
                onChange={(e) => setItemsCount(Number(e.target.value))}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#006a61]/10 focus:border-[#006a61] outline-none"
              />
            </div>

            {/* Priority */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">PRIORIDAD DE CARRETERA</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-2 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#006a61]/10 focus:border-[#006a61] outline-none bg-white font-semibold"
              >
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
            </div>

          </div>

          <div className="flex justify-end pt-2">
            <button 
              type="submit"
              className="bg-black hover:bg-slate-900 text-white px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Truck size={14} />
              <span>Calcular Ruta e Iniciar Orden</span>
            </button>
          </div>
        </form>
      )}

      {/* Search & Multiprecision Filters board */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col lg:flex-row gap-4 items-stretch justify-between">
        
        {/* Search Input left */}
        <div className="relative w-full lg:max-w-xs shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text"
            placeholder="Buscar por tracking, ciudad, transportista..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#006a61]/10 focus:border-[#006a61] outline-none bg-white placeholder:text-slate-400"
          />
        </div>

        {/* Action Filters parameters */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
          
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold">Estado:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none bg-white cursor-pointer"
            >
              <option value="Todos">Todos</option>
              <option value="En Tránsito">En Tránsito</option>
              <option value="Entregado">Entregado</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Retrasado">Retrasado</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold">Prioridad:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none bg-white cursor-pointer"
            >
              <option value="Todos">Todos</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none bg-white cursor-pointer"
            >
              <option value="estimatedDelivery">Entrega Estimada</option>
              <option value="weight">Peso (Mayor a menor)</option>
              <option value="trackingNumber">Nº Seguimiento</option>
            </select>
          </div>

        </div>

      </div>

      {/* Main Table Structure & Detailed Dispatch Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

        {/* Deliveries Table (Col span 3) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden xl:col-span-3">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-400 font-bold tracking-wider uppercase border-b border-slate-100">
                <tr>
                  <th className="px-5 py-4">Nº Seguimiento</th>
                  <th className="px-5 py-4">Ruta (Origen a Destino)</th>
                  <th className="px-5 py-4">Prioridad</th>
                  <th className="px-5 py-4">Estatus</th>
                  <th className="px-5 py-4">Transportista</th>
                  <th className="px-5 py-4 text-right">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredShipments.map((s) => {
                  let badge = 'bg-slate-100 text-slate-600 border-slate-200';
                  if (s.status === 'Entregado') {
                    badge = 'bg-emerald-50 text-emerald-800 border-emerald-100';
                  } else if (s.status === 'En Tránsito') {
                    badge = 'bg-blue-50 text-blue-800 border-blue-100';
                  } else if (s.status === 'Pendiente') {
                    badge = 'bg-amber-50 text-amber-800 border-amber-100';
                  } else if (s.status === 'Retrasado') {
                    badge = 'bg-rose-50 text-rose-800 border-rose-100';
                  }

                  let priorityText = 'bg-slate-50 text-slate-500 border-slate-100';
                  if (s.priority === 'Alta') {
                    priorityText = 'bg-indigo-50 text-indigo-700 border-indigo-100 font-bold';
                  }

                  const isSelected = selectedShipment?.id === s.id;

                  return (
                    <tr 
                      key={s.id} 
                      onClick={() => setSelectedShipment(s)}
                      className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#006a61]/5 hover:bg-[#006a61]/5 font-semibold text-[#006a61]' : ''
                      }`}
                    >
                      {/* Tracking code */}
                      <td className="px-5 py-4 font-mono font-bold text-slate-900 truncate">
                        {s.trackingNumber}
                      </td>

                      {/* Route origins */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-600">{s.origin}</span>
                          <ArrowRight size={12} className="text-slate-400" />
                          <span className="font-bold text-slate-800">{s.destination}</span>
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded border text-[10px] ${priorityText}`}>
                          {s.priority}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${badge}`}>
                          {s.status}
                        </span>
                      </td>

                      {/* Carrier */}
                      <td className="px-5 py-4 text-slate-500 font-normal">
                        {s.carrier}
                      </td>

                      {/* Details trigger */}
                      <td className="px-5 py-4 text-right">
                        <button className="text-slate-400 hover:text-slate-950 font-bold transition-all inline-flex items-center gap-0.5 cursor-pointer">
                          <span>Ver</span>
                          <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredShipments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-slate-400 space-y-2">
                      <Truck size={40} className="mx-auto text-slate-300 stroke-1" />
                      <p className="text-xs font-semibold">No se encontraron órdenes vigentes con los filtros seleccionados.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between text-slate-500 font-medium font-semibold">
            <span>Mostrando <strong>{filteredShipments.length}</strong> mercancías despachadas de un pool global.</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#006a61]">SmartLogix SaaS Engine 2.1</span>
          </div>
        </div>

        {/* Detailed Leaflet/Drawer Panel (1 column) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between h-fit">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-0.5">Detalle de Operador</h3>
            <p className="text-[11px] text-slate-400 mb-4">Información de ruta logística y auditoría</p>

            {selectedShipment ? (
              <div className="space-y-5">
                
                {/* Visual Route Panel info */}
                <div className="p-4 bg-slate-50 rounded-lg space-y-3 relative overflow-hidden border border-slate-100">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-[#006a61]">{selectedShipment.trackingNumber}</span>
                    <h4 className="text-xs font-bold text-slate-900 uppercase">Ficha Técnica de Tránsito</h4>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-rose-500" />
                      <div>
                        <p className="text-[10px] text-slate-400">Origen:</p>
                        <p className="font-bold text-slate-800">{selectedShipment.origin}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-emerald-500" />
                      <div>
                        <p className="text-[10px] text-slate-400">Destino:</p>
                        <p className="font-bold text-slate-800">{selectedShipment.destination}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Specs */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100 font-semibold">
                    <span className="text-slate-400 font-medium font-semibold">Transportista:</span>
                    <span className="font-bold text-slate-850">{selectedShipment.carrier}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 font-semibold">
                    <span className="text-slate-400 font-medium font-semibold">Peso Autorizado:</span>
                    <span className="font-bold text-slate-850">{selectedShipment.weight} kg</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 font-semibold">
                    <span className="text-slate-400 font-medium font-semibold">Bultos Totales:</span>
                    <span className="font-bold text-slate-850">{selectedShipment.itemsCount} Pallets</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 font-semibold">
                    <span className="text-slate-400 font-medium font-semibold">Entrega Estimada:</span>
                    <span className="font-mono text-indigo-700 font-bold">{selectedShipment.estimatedDelivery}</span>
                  </div>
                </div>

                {/* Manual Status Controller */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold tracking-widest text-[#7c839b] uppercase block">Actualizar Estado de Entrega</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {['En Tránsito', 'Entregado', 'Pendiente', 'Retrasado'].map((statusOption) => (
                      <button
                        key={statusOption}
                        onClick={() => handleUpdateStatusLocal(statusOption as any)}
                        className={`px-2 py-1.5 rounded transition-all text-[10px] font-bold border cursor-pointer ${
                          selectedShipment.status === statusOption 
                            ? 'bg-slate-900 border-slate-900 text-white shadow-xs' 
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {statusOption}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Logs History timeline */}
                <div className="space-y-2">
                  <h5 className="text-[10px] font-bold tracking-widest text-[#7c839b] uppercase">Bitácora de Ruta</h5>
                  <div className="max-h-40 overflow-y-auto pr-1 space-y-2 text-[11px] border border-slate-100 p-2.5 rounded-lg bg-slate-50/50">
                    {selectedShipment.timeline?.map((step, idx) => (
                      <div key={idx} className="border-l-2 border-[#006a61] pl-2.5 relative space-y-0.5">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-800 uppercase text-[10px]">{step.status}</span>
                          <span className="text-[9px] text-slate-400 font-mono">{step.timestamp.split(' ')[1]}</span>
                        </div>
                        <p className="text-slate-500 text-[10px] leading-relaxed">{step.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-center space-y-3 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                <Gauge size={32} className="text-[#006a61] opacity-70 animate-bounce" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-[#0b1c30]">Auditar Envío</p>
                  <p className="text-[11px] text-slate-400">Selecciona cualquier envío en la tabla para ver su bitácora de carretera y cambiar estados.</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-xl text-[11px] mt-4 font-normal flex items-start gap-2">
            <X size={14} className="shrink-0 text-indigo-600 mt-0.5 hidden" />
            <span>Las rutas del muelle de carga general son evaluadas por telemetría GPS y registradas automáticamente en el pool logístico.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
