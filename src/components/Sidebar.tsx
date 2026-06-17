import React from 'react';
import { 
  BarChart3, 
  Warehouse, 
  Truck, 
  Bot, 
  Settings, 
  LogOut, 
  Database,
  Building2,
  ChevronLeft
} from 'lucide-react';
import { UserProfile } from '../types';

interface SidebarProps {
  currentTab: 'overview' | 'warehouse' | 'shipments' | 'ai-hub';
  setCurrentTab: (tab: 'overview' | 'warehouse' | 'shipments' | 'ai-hub') => void;
  user: UserProfile;
  onLogout: () => void;
}

export default function Sidebar({ currentTab, setCurrentTab, user, onLogout }: SidebarProps) {
  const navItems = [
    { id: 'overview', label: 'Resumen Logístico', icon: BarChart3 },
    { id: 'warehouse', label: 'Almacenes Inteligentes', icon: Warehouse },
    { id: 'shipments', label: 'Seguimiento de Envíos', icon: Truck },
    { id: 'ai-hub', label: 'Optimizador Inteligente IA', icon: Bot },
  ] as const;

  return (
    <aside className="w-64 bg-[#131b2e] text-white flex flex-col justify-between border-r border-slate-800 shrink-0 h-screen sticky top-0">
      
      {/* Brand logo & title */}
      <div>
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white text-slate-900 rounded flex items-center justify-center font-bold">
              <Database size={16} />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white">SmartLogix</h1>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">LOGISTICS SOLUTIONS</p>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-4 space-y-1.5">
          <p className="px-3 text-[10px] font-bold tracking-widest text-[#7c839b] uppercase mb-2">Módulos de Control</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-[#006a61] text-white font-bold shadow-lg shadow-[#006a61]/15' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User info & logout */}
      <div className="p-4 border-t border-slate-800 bg-[#0b1222]/80">
        <div className="flex items-start gap-2.5 mb-4 p-2 rounded-lg">
          <div className="w-9 h-9 rounded-full bg-slate-700 font-bold flex items-center justify-center text-xs text-[#89f5e7] border border-slate-600">
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-white truncate">{user.name}</h4>
            <p className="text-[10px] text-[#7c839b] truncate">{user.role}</p>
            <div className="flex items-center gap-1 mt-1 text-[9px] text-[#89f5e7] font-medium">
              <Building2 size={10} />
              <span className="truncate">{user.company}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-slate-800 hover:border-slate-700 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-rose-950/20 hover:border-rose-900/30 transition-all cursor-pointer"
        >
          <LogOut size={14} className="text-rose-400" />
          <span>Cerrar Sesión</span>
        </button>
      </div>

    </aside>
  );
}
