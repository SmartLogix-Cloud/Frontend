import React, { useState, useMemo } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface OrdersViewProps {
  orders: Order[];
  onOpenNewOrderModal?: () => void;
  onOpenOrderDetails?: (order: Order) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  onOpenNewOrderModal,
  onOpenOrderDetails,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('Todos los estados');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Estado de paginación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(4);

  // Filtrado de órdenes
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== 'Todos los estados' && order.status !== statusFilter) {
        return false;
      }
      if (dateFilter && order.dateRaw !== dateFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesId = order.id.toLowerCase().includes(query);
        const matchesClient = order.client.name.toLowerCase().includes(query);
        const matchesCompany = order.client.company?.toLowerCase().includes(query);
        if (!matchesId && !matchesClient && !matchesCompany) {
          return false;
        }
      }
      return true;
    });
  }, [orders, statusFilter, dateFilter, searchTerm]);

  // Cálculos de paginación
  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  // Badge de estados
  const renderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Pendiente':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#FFFBEB] text-[#B45309] font-medium text-[11px] leading-tight border border-amber-200/50">
            Pendiente
          </span>
        );
      case 'En Preparación':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#1D4ED8] font-medium text-[11px] leading-tight border border-blue-200/50">
            En Preparación
          </span>
        );
      case 'Aprobado':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#F0FDFA] text-[#0D9488] font-medium text-[11px] leading-tight border border-teal-200/50">
            Aprobado
          </span>
        );
      case 'Enviado':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#F1F5F9] text-[#475569] font-medium text-[11px] leading-tight border border-slate-200/50">
            Enviado
          </span>
        );
      case 'Cancelado':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#FEF2F2] text-[#DC2626] font-medium text-[11px] leading-tight border border-rose-200/50">
            Cancelado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-medium text-[11px]">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="p-6 md:p-8 flex-1 flex flex-col gap-6 md:gap-8 max-w-[1440px] mx-auto w-full">
      {/* Encabezado y Botón Nuevo Pedido */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#0B1C30]">
              Procesamiento de Pedidos
            </h1>
            <p className="text-sm md:text-base text-[#45464D] mt-1">
              Gestiona y visualiza las órdenes entrantes del sistema.
            </p>
          </div>
          {onOpenNewOrderModal && (
            <button
              onClick={onOpenNewOrderModal}
              className="bg-[#0F172A] text-white px-4 py-2.5 rounded-lg font-semibold text-xs tracking-wide hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm cursor-pointer active:scale-95 duration-150 shrink-0"
            >
              <Plus size={16} />
              <span>Nuevo Pedido</span>
            </button>
          )}
        </div>

        {/* Panel de Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-6 rounded-xl shadow-[0px_1px_3px_rgba(15,23,42,0.08)] border border-[#E2E8F0]">
          {/* Filtro 1: Estado */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-semibold text-[#45464D] uppercase tracking-wider">
              Estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-[#E2E8F0] rounded-md px-3 py-2 bg-[#F8F9FF] text-sm text-[#0B1C30] focus:outline-none focus:border-[#131B2E] transition-colors cursor-pointer"
            >
              <option value="Todos los estados">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En Preparación">En Preparación</option>
              <option value="Aprobado">Aprobado</option>
              <option value="Enviado">Enviado</option>
            </select>
          </div>

          {/* Filtro 2: Fecha */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-semibold text-[#45464D] uppercase tracking-wider">
                Fecha
              </label>
              {dateFilter && (
                <button
                  onClick={() => setDateFilter('')}
                  className="text-[11px] text-teal-700 hover:underline cursor-pointer font-medium"
                >
                  Limpiar
                </button>
              )}
            </div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-[#E2E8F0] rounded-md px-3 py-2 bg-[#F8F9FF] text-sm text-[#0B1C30] focus:outline-none focus:border-[#131B2E] transition-colors"
            />
          </div>

          {/* Filtro 3: Búsqueda Cliente / ID */}
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-[11px] font-semibold text-[#45464D] uppercase tracking-wider">
              Buscar Cliente / ID
            </label>
            <div className="relative flex items-center">
              <Search size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Ej: Juan Pérez o #ORD-123"
                className="w-full border border-[#E2E8F0] rounded-md pl-9 pr-9 py-2 bg-[#F8F9FF] text-sm text-[#0B1C30] focus:outline-none focus:border-[#131B2E] transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tabla de Órdenes */}
      <section className="bg-white rounded-xl shadow-[0px_1px_3px_rgba(15,23,42,0.08)] border border-[#E2E8F0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <th className="py-4 px-6 text-xs font-semibold text-[#45464D] uppercase tracking-wider">
                  ID Pedido
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-[#45464D] uppercase tracking-wider">
                  Cliente
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-[#45464D] uppercase tracking-wider">
                  Fecha
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-[#45464D] uppercase tracking-wider text-right">
                  Monto
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-[#45464D] uppercase tracking-wider text-center">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="text-sm text-[#0B1C30] divide-y divide-[#E2E8F0]">
              {currentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search size={32} className="text-slate-300" />
                      <p className="font-medium text-slate-700">No se encontraron pedidos con estos filtros</p>
                      <button
                        onClick={() => {
                          setStatusFilter('Todos los estados');
                          setDateFilter('');
                          setSearchTerm('');
                        }}
                        className="text-xs text-teal-700 hover:underline font-medium mt-1 cursor-pointer"
                      >
                        Restablecer todos los filtros
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                currentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-[#F1F5F9] transition-colors"
                  >
                    <td className="py-4 px-6 font-semibold text-[#0B1C30] whitespace-nowrap">
                      {onOpenOrderDetails ? (
                        <button
                          onClick={() => onOpenOrderDetails(order)}
                          className="hover:text-teal-700 transition-colors text-left font-bold"
                        >
                          {order.id}
                        </button>
                      ) : (
                        order.id
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#E2E8F0] flex items-center justify-center text-[#45464D] text-xs font-bold shrink-0">
                          {order.client.initials}
                        </div>
                        <div className="truncate max-w-[220px]">
                          <span className="font-medium block truncate">{order.client.name}</span>
                          {order.client.company && order.client.company !== order.client.name && (
                            <span className="text-[11px] text-slate-400 block truncate">
                              {order.client.company}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-[#45464D] whitespace-nowrap">
                      {order.date}
                    </td>
                    <td className="py-4 px-6 text-right font-medium font-mono tabular-nums whitespace-nowrap">
                      ${order.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-center">
                      {renderStatusBadge(order.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Barra de Paginación */}
        <div className="bg-[#F8FAFC] border-t border-[#E2E8F0] px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#45464D]">
              Mostrando {totalItems === 0 ? 0 : startIndex + 1} a {endIndex} de {totalItems} pedidos
            </span>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
              <span>Por página:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-[#E2E8F0] rounded px-1.5 py-0.5 bg-white text-xs text-slate-700 cursor-pointer"
              >
                <option value={4}>4</option>
                <option value={8}>8</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="px-3 py-1 rounded border border-[#E2E8F0] bg-white text-[#0B1C30] hover:bg-[#F1F5F9] disabled:opacity-50 disabled:pointer-events-none text-sm transition-colors cursor-pointer"
            >
              Anterior
            </button>

            <div className="hidden md:flex items-center gap-1 text-xs font-medium text-slate-600">
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded flex items-center justify-center transition-colors cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-[#0F172A] text-white'
                        : 'border border-[#E2E8F0] bg-white text-slate-700 hover:bg-[#F1F5F9]'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && <span className="px-1 text-slate-400">...</span>}
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="px-3 py-1 rounded border border-[#E2E8F0] bg-white text-[#0B1C30] hover:bg-[#F1F5F9] disabled:opacity-50 disabled:pointer-events-none text-sm transition-colors cursor-pointer"
            >
              Siguiente
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};