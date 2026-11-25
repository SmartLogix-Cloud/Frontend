import React, { useEffect, useState } from 'react';
import { X, Plus, Loader2, ArrowRight } from 'lucide-react';
import { api, getErrorMessage } from '../client/apiClient';
import { CatalogProduct, Order } from '../types';

const money = (n: number) =>
  `$${n.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-bold text-[#0b1c30]">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 cursor-pointer" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">{children}</div>
      </div>
    </div>
  );
}

const labelCls = 'block text-[11px] font-bold tracking-widest text-slate-500 uppercase mb-1';
const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600';

// ------------------------------------------------------------------
// Nuevo pedido -> POST /orders (ms-order publica ORDER_CREATED en Kafka)
// ------------------------------------------------------------------
export function NewOrderModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [catalog, setCatalog] = useState<CatalogProduct[]>([]);
  const [customerId, setCustomerId] = useState('CLI-DEMO');
  const [type, setType] = useState<'ESTANDAR' | 'EXPRESS'>('ESTANDAR');
  const [productId, setProductId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getCatalog()
      .then((list) => {
        const active = (list || []).filter((p) => p.active !== false);
        setCatalog(active);
        if (active.length) setProductId(active[0].productId);
      })
      .catch((e) => setError(`No se pudo cargar el catálogo: ${getErrorMessage(e)}`));
  }, []);

  const product = catalog.find((p) => p.productId === productId);
  const subtotal = product ? Number(product.price) * quantity : 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setSaving(true);
    setError('');
    try {
      await api.createOrder({
        type,
        customerId: customerId.trim(),
        items: [{ productId: product.productId, sku: product.sku, quantity, unitPrice: Number(product.price) }],
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title="Nuevo pedido" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Cliente</label>
            <input className={inputCls} value={customerId} onChange={(e) => setCustomerId(e.target.value)} required maxLength={64} />
          </div>
          <div>
            <label className={labelCls}>Tipo</label>
            <select className={inputCls} value={type} onChange={(e) => setType(e.target.value as 'ESTANDAR' | 'EXPRESS')}>
              <option value="ESTANDAR">Estándar</option>
              <option value="EXPRESS">Express</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className={labelCls}>Producto</label>
            <select className={inputCls} value={productId} onChange={(e) => setProductId(Number(e.target.value))} required>
              {catalog.map((p) => (
                <option key={p.productId} value={p.productId}>
                  {p.name} — {money(Number(p.price))}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Cantidad</label>
            <input type="number" min={1} className={inputCls} value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))} />
          </div>
        </div>
        <div className="flex justify-between text-sm bg-slate-50 rounded-lg px-4 py-3">
          <span className="text-slate-500">Subtotal (sin IVA)</span>
          <span className="font-bold font-mono">{money(subtotal)}</span>
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
            Cancelar
          </button>
          <button type="submit" disabled={saving || !product}
            className="px-4 py-2 text-sm rounded-lg bg-[#0b1c30] text-white font-semibold flex items-center gap-2 disabled:opacity-50 cursor-pointer">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Crear pedido
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// ------------------------------------------------------------------
// Ficha del pedido -> PATCH /orders/{id}/status
// Solo ofrece las transiciones válidas de la máquina de estados de ms-order.
// FINALIZADO e INCIDENCIA no se ofrecen: llegan solos desde ms-shipping (RabbitMQ).
// ------------------------------------------------------------------
const STATUS_LABEL: Record<string, string> = {
  PENDIENTE_PREPARACION: 'Pendiente de preparación',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado',
  EN_PREPARACION: 'En preparación',
  CANCELADO: 'Cancelado',
  FINALIZADO: 'Finalizado',
  INCIDENCIA: 'Incidencia',
};

const NEXT_ACTIONS: Record<string, { status: string; label: string; primary?: boolean; hint?: string }[]> = {
  PENDIENTE_PREPARACION: [
    { status: 'APROBADO', label: 'Aprobar', primary: true },
    { status: 'RECHAZADO', label: 'Rechazar' },
    { status: 'CANCELADO', label: 'Cancelar' },
  ],
  APROBADO: [
    { status: 'EN_PREPARACION', label: 'Pasar a preparación', primary: true,
      hint: 'Envía order.ready-for-shipment por RabbitMQ: ms-shipping crea el envío.' },
    { status: 'CANCELADO', label: 'Cancelar' },
  ],
  EN_PREPARACION: [
    { status: 'CANCELADO', label: 'Cancelar',
      hint: 'El avance lo gobierna el envío: al marcarlo Entregado en "Seguimiento de Envíos", ms-shipping avisa por RabbitMQ y el pedido pasa a Finalizado.' },
  ],
  INCIDENCIA: [
    { status: 'CANCELADO', label: 'Cancelar' },
  ],
};

export function OrderDetailsModal({ order, onClose, onChanged }: { order: Order; onClose: () => void; onChanged: () => void }) {
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState('');
  const current = order.backendStatus ?? '';
  const actions = NEXT_ACTIONS[current] ?? [];

  const change = async (status: string) => {
    setSaving(status);
    setError('');
    try {
      await api.updateOrderStatus(order.orderId, status, 'Cambio desde el panel web');
      onChanged();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(null);
    }
  };

  return (
    <ModalShell title={`Pedido ${order.id}`} onClose={onClose}>
      <div className="grid grid-cols-2 gap-y-2 text-sm">
        <span className="text-slate-500">Cliente</span>
        <span className="font-semibold text-right">{order.client.name}</span>
        <span className="text-slate-500">Fecha</span>
        <span className="text-right">{order.date}</span>
        <span className="text-slate-500">Monto</span>
        <span className="font-mono font-bold text-right">{money(order.amount)}</span>
        <span className="text-slate-500">Estado</span>
        <span className="font-semibold text-right">{STATUS_LABEL[current] ?? current}</span>
      </div>

      {actions.length > 0 ? (
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <p className={labelCls}>Cambiar estado</p>
          <div className="flex flex-wrap gap-2">
            {actions.map((a) => (
              <button key={a.status} onClick={() => change(a.status)} disabled={saving !== null}
                className={`px-4 py-2 text-sm rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 cursor-pointer ${
                  a.primary ? 'bg-[#006a61] text-white hover:bg-[#00544d]' : 'border border-slate-200 hover:bg-slate-50'
                }`}>
                {saving === a.status ? <Loader2 size={14} className="animate-spin" /> : a.primary ? <ArrowRight size={14} /> : null}
                {a.label}
              </button>
            ))}
          </div>
          {actions.filter((a) => a.hint).map((a) => (
            <p key={a.status} className="text-xs text-slate-500">{a.hint}</p>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500 pt-2 border-t border-slate-100">
          Estado final: no admite más cambios.
        </p>
      )}

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
    </ModalShell>
  );
}
