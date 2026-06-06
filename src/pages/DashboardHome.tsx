import React from 'react';
import { 
  TrendingUp, 
  Package, 
  Truck, 
  Warehouse, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Flame,
  ArrowUpRight
} from 'lucide-react';
import { Shipment, LogisticsLog, UserProfile } from '../types';

interface DashboardHomeProps {
  user: UserProfile;
  shipments: Shipment[];
  logs: LogisticsLog[];
  onNavigateToTab: (tab: 'overview' | 'warehouse' | 'shipments' | 'ai-hub') => void;
}

export default function DashboardHome({ user, shipments, logs, onNavigateToTab }: DashboardHomeProps) {
  // Stats calculations
  const totalShipments = shipments.length;
  const transitCount = shipments.filter(s => s.status === 'En Tránsito').length;
  const delayedCount = shipments.filter(s => s.status === 'Retrasado').length;
  
  // Calculate aggregate weight in metric tons
  const totalWeightTons = (shipments.reduce((sum, s) => sum + s.weight, 0) / 1000).toFixed(1);

  // Hardcoded capacity percentages for visualization
  const warehouses = [
    { name: 'Muelle Central A', progress: 84, color: 'bg-[#006a61]' },
    { name: 'Cámara Fría B3', progress: 62, color: 'bg-indigo-600' },
    { name: 'Zona de Carga General O1', progress: 45, color: 'bg-emerald-600' },
    { name: 'Terminal Expresa Sur', progress: 91, color: 'bg-amber-600' },
  ];

  // Daily statistics for custom SVG chart
  const dailyDispatches = [
    { day: 'Lun', success: 42, delayed: 3 },
    { day: 'Mar', success: 58, delayed: 2 },
    { day: 'Mié', success: 61, delayed: 5 },
    { day: 'Jue', success: 49, delayed: 1 },
    { day: 'Vie', success: 75, delayed: 8 },
    { day: 'Sáb', success: 38, delayed: 2 },
    { day: 'Dom', success: 25, delayed: 0 },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#006a61]">PANEL PRINCIPAL</span>
          <h2 className="text-xl font-extrabold text-[#0b1c30] mt-0.5">Control de Cadena de Suministro</h2>
          <p className="text-slate-500 text-xs mt-0.5">Centro operativo de SmartLogix para <span className="font-bold text-slate-800">{user.company}</span>. Datos sincronizados hace un momento.</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-lg text-xs font-mono text-slate-600">
          <Clock size={14} className="text-slate-400" />
          <span>UTC: {new Date().toISOString().substring(0, 16).replace('T', ' ')}</span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-sm transition-all flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Flujo Total de Envíos</p>
            <h3 className="text-2xl font-bold text-slate-900">{totalShipments}</h3>
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#006a61]">
              <TrendingUp size={12} />
              <span>+14.8% este mes</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#006a61]/5 text-[#006a61] flex items-center justify-center font-bold">
            <Truck size={20} />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-sm transition-all flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Unidades en Tránsito</p>
            <h3 className="text-2xl font-bold text-slate-900">{transitCount}</h3>
            <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-600">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
              <span>Monitoreo Activo</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Package size={20} />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-sm transition-all flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Envíos Retrasados</p>
            <h3 className="text-2xl font-bold text-slate-900">{delayedCount}</h3>
            <div className={`flex items-center gap-1 text-[11px] font-bold ${delayedCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {delayedCount > 0 ? (
                <>
                  <AlertTriangle size={12} />
                  <span>Requiere atención</span>
                </>
              ) : (
                <>
                  <CheckCircle size={12} />
                  <span>Optimización del 100%</span>
                </>
              )}
            </div>
          </div>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${delayedCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'}`}>
            <Flame size={20} />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-sm transition-all flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-semibold">Tonelaje Procesado</p>
            <h3 className="text-2xl font-bold text-slate-900">{totalWeightTons} <span className="text-xs text-slate-400">Ton</span></h3>
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
              <span>Peso total de mercancías</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <Warehouse size={20} />
          </div>
        </div>

      </div>

      {/* Main Stats and Warehouse Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Statistics Chart (Custom interactive SVG and tables) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#0b1c30]">Flujo de Despacho Diario</h3>
                <p className="text-[11px] text-slate-400">Envíos exitosos vs retrasados por día laboral</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <span className="w-3 h-3 rounded-full bg-[#006a61]"></span>
                  <span>Exitosos</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <span className="w-3 h-3 rounded-full bg-rose-400"></span>
                  <span>Retrasados</span>
                </div>
              </div>
            </div>

            {/* Custom Responsive SVG Chart Bar */}
            <div className="relative w-full h-56 mt-2">
              <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                {/* Y-axis helper lines */}
                <line x1="40" y1="20" x2="490" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="65" x2="490" y2="65" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="110" x2="490" y2="110" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="155" x2="490" y2="155" stroke="#e2e8f0" strokeWidth="1" />

                {/* Draw bars */}
                {dailyDispatches.map((data, index) => {
                  const x = 40 + index * 60 + 15;
                  
                  // Heights derived relative to max 100 values
                  const successHeight = (data.success / 100) * 135;
                  const delayedHeight = (data.delayed / 100) * 135;
                  
                  const ySuccess = 155 - successHeight;
                  const yDelayed = ySuccess - delayedHeight;

                  return (
                    <g key={data.day} className="group cursor-pointer">
                      {/* Success Bar */}
                      <rect 
                        x={x} 
                        y={ySuccess} 
                        width="18" 
                        height={successHeight} 
                        fill="#006a61" 
                        rx="2"
                        className="transition-colors hover:fill-[#005049]" 
                      />
                      
                      {/* Delayed Bar */}
                      {delayedHeight > 0 && (
                        <rect 
                          x={x} 
                          y={yDelayed} 
                          width="18" 
                          height={delayedHeight} 
                          fill="#fb7185" 
                          rx="2"
                          className="transition-colors hover:fill-rose-500"
                        />
                      )}

                      {/* Day Label */}
                      <text 
                        x={x + 9} 
                        y="175" 
                        textAnchor="middle" 
                        className="text-[10px] font-semibold fill-slate-400"
                      >
                        {data.day}
                      </text>

                      {/* Quantity display */}
                      <text 
                        x={x + 9} 
                        y={yDelayed - 6} 
                        textAnchor="middle" 
                        className="text-[9px] font-bold fill-slate-800 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {data.success + data.delayed}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Capacidad de despacho promedio aumentará un <strong>12%</strong> debido a las mejoras de ruta de IA.</span>
            <button 
              onClick={() => onNavigateToTab('ai-hub')}
              className="text-[#006a61] hover:text-[#005049] font-bold flex items-center gap-1"
            >
              <span>Optimizar</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        {/* Warehouse Storage Capacities */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#0b1c30] mb-0.5">Ocupación de Almacenes</h3>
            <p className="text-[11px] text-slate-400 mb-4">Capacidad física ocupada en tiempo real</p>

            <div className="space-y-4">
              {warehouses.map((w) => (
                <div key={w.name} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700 truncate">{w.name}</span>
                    <span className="font-bold text-slate-900">{w.progress}%</span>
                  </div>
                  
                  {/* Progress bar container */}
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${w.color} transition-all duration-800`} 
                      style={{ width: `${w.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-5 mt-4 border-t border-slate-100">
            <button 
              onClick={() => onNavigateToTab('warehouse')}
              className="w-full text-center py-2 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all block cursor-pointer"
            >
              Administrar Espacios e Inventario
            </button>
          </div>
        </div>

      </div>

      {/* Live logs and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Log list (Col-span 2) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#0b1c30]">Monitoreo de Eventos en Vivo</h3>
              <p className="text-[11px] text-slate-400">Actualizaciones lógicas inmediatas de la cadena de suministro</p>
            </div>
            <span className="px-2 py-1 text-[10px] font-bold text-[#006a61] bg-[#006a61]/5 rounded">
              Tiempo Real
            </span>
          </div>

          <div className="space-y-3.5">
            {logs.slice(0, 4).map((log) => {
              let tagColor = 'bg-slate-100 text-slate-700 border-slate-200';
              let iconNode = <Clock size={12} />;

              if (log.type === 'shipment_update') {
                tagColor = 'bg-[#006a61]/10 text-[#006a61] border-[#006a61]/20';
                iconNode = <Truck size={12} />;
              } else if (log.type === 'inventory_alert') {
                tagColor = 'bg-amber-50 text-amber-800 border-amber-200';
                iconNode = <AlertTriangle size={12} />;
              } else if (log.type === 'security_event') {
                tagColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                iconNode = <CheckCircle size={12} />;
              }

              return (
                <div 
                  key={log.id} 
                  className="flex items-start gap-3 p-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-lg transition-colors text-xs"
                >
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${tagColor} border`}>
                    {iconNode}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className="text-slate-800 font-medium">{log.message}</p>
                    <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 font-semibold items-center">
                      <span className="font-mono">{log.timestamp}</span>
                      <span>•</span>
                      <span>Operador: {log.operator}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick actions box */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#0b1c30] mb-0.5">Centro de Despacho Rápido</h3>
            <p className="text-[11px] text-slate-400 mb-4 font-normal">Acciones logísticas directas</p>

            <div className="space-y-3">
              <button 
                onClick={() => onNavigateToTab('shipments')}
                className="w-full flex items-center justify-between p-3 border border-slate-100 hover:border-[#006a61]/30 bg-slate-50/50 hover:bg-slate-50 rounded-lg text-xs text-slate-800 font-semibold transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 bg-[#006a61]/5 text-[#006a61] rounded flex items-center justify-center">
                    <Truck size={12} />
                  </div>
                  <span>Generar Orden de Envío</span>
                </div>
                <span className="text-slate-400 group-hover:text-slate-700 font-bold">→</span>
              </button>

              <button 
                onClick={() => onNavigateToTab('warehouse')}
                className="w-full flex items-center justify-between p-3 border border-slate-100 hover:border-indigo-100 bg-slate-50/50 hover:bg-slate-50 rounded-lg text-xs text-slate-800 font-semibold transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 bg-indigo-50 text-indigo-600 rounded flex items-center justify-center">
                    <Package size={12} />
                  </div>
                  <span>Ingresar Lote de Stock</span>
                </div>
                <span className="text-slate-400 group-hover:text-slate-700 font-bold">→</span>
              </button>

              <button 
                onClick={() => onNavigateToTab('ai-hub')}
                className="w-full flex items-center justify-between p-3 border border-slate-100 hover:border-purple-100 bg-[#131b2e]/5 hover:bg-[#131b2e]/10 rounded-lg text-xs text-slate-800 font-semibold transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 bg-[#131b2e] text-[#89f5e7] rounded flex items-center justify-center font-bold">
                    <span>AI</span>
                  </div>
                  <span>Optimación de Rutas Inteligentes</span>
                </div>
                <span className="text-[#006a61] font-bold">→</span>
              </button>
            </div>
          </div>

          <div className="bg-[#006a61]/5 border border-[#006a61]/10 rounded-xl p-3.5 text-xs text-[#006a61] font-medium leading-relaxed mt-4">
            💡 <strong>Tip SmartLogix:</strong> Puedes utilizar el Optimizador Inteligente IA para analizar inmediatamente retrasos en la ruta sur debido a inclemencias climáticas.
          </div>
        </div>

      </div>

    </div>
  );
}
