import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Activity, AlertTriangle, PackageCheck, RefreshCw, ShoppingCart, Truck } from 'lucide-react';
import { api, getErrorMessage } from '../client/apiClient';
import { AnalyticsSummary, StreamEvent } from '../types';

/** Frecuencia de refresco: las metricas cambian apenas Kafka entrega un evento. */
const REFRESH_MS = 3000;

const STATUS_COLORS: Record<string, string> = {
  PENDIENTE_PREPARACION: 'bg-amber-400',
  APROBADO: 'bg-teal-500',
  EN_PREPARACION: 'bg-blue-500',
  FINALIZADO: 'bg-emerald-500',
  CANCELADO: 'bg-rose-500',
  RECHAZADO: 'bg-rose-400',
  INCIDENCIA: 'bg-orange-500',
  LISTO_PARA_RETIRO: 'bg-amber-400',
  RETIRADO: 'bg-sky-400',
  EN_TRANSITO: 'bg-blue-500',
  ENTREGADO: 'bg-emerald-500',
  RETRASADO: 'bg-orange-400',
  ENTREGA_FALLIDA: 'bg-orange-600',
  PERDIDO: 'bg-rose-600',
};

const formatClp = (value: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value);

const formatTime = (iso: string | null) => (iso ? new Date(iso).toLocaleTimeString('es-CL') : '—');

/**
 * Vista de streaming en tiempo real: metricas que ms-analytics calcula a partir de
 * los topicos Kafka smartlogix.order-events y smartlogix.shipment-events, y el feed
 * de los ultimos eventos (topico, particion y offset de cada uno).
 */
export const StreamingView: React.FC = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const seenOffsets = useRef<Set<string>>(new Set());
  const [freshKeys, setFreshKeys] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    try {
      const [s, e] = await Promise.all([api.getAnalyticsSummary(), api.getAnalyticsEvents(15)]);
      const keyOf = (ev: StreamEvent) => `${ev.topic}-${ev.partition}-${ev.offset}`;
      const fresh = new Set(e.map(keyOf).filter((k) => seenOffsets.current.size > 0 && !seenOffsets.current.has(k)));
      e.forEach((ev) => seenOffsets.current.add(keyOf(ev)));
      setSummary(s);
      setEvents(e);
      setFreshKeys(fresh);
      setError(null);
      setLastRefresh(new Date());
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    load();
    if (paused) return undefined;
    const timer = setInterval(load, REFRESH_MS);
    return () => clearInterval(timer);
  }, [load, paused]);

  const kpis = summary
    ? [
        { label: 'Pedidos observados', value: String(summary.totalOrders), icon: ShoppingCart },
        { label: 'Ventas activas', value: formatClp(summary.activeRevenue), icon: Activity },
        { label: 'Envíos en curso', value: String(summary.totalShipments), icon: Truck },
        { label: 'Tasa de entrega', value: `${summary.deliveryRate.toFixed(1)}%`, icon: PackageCheck },
        { label: 'Incidencias activas', value: String(summary.activeIncidents), icon: AlertTriangle },
      ]
    : [];

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Streaming en tiempo real</h1>
          <p className="text-sm text-slate-500">
            Métricas calculadas por <span className="font-medium">ms-analytics</span> desde los tópicos Kafka{' '}
            <code className="text-xs">smartlogix.order-events</code> y{' '}
            <code className="text-xs">smartlogix.shipment-events</code>.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${error ? 'bg-rose-500' : paused ? 'bg-slate-400' : 'bg-emerald-500 animate-pulse'}`} />
            {error ? 'Sin conexión' : paused ? 'En pausa' : 'En vivo'} · {lastRefresh ? lastRefresh.toLocaleTimeString('es-CL') : '—'}
          </span>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw size={14} /> {paused ? 'Reanudar' : 'Pausar'}
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          No se pudieron obtener las métricas: {error}
        </div>
      )}

      <section className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {kpis.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500">
              {label} <Icon size={16} className="text-slate-400" />
            </div>
            <div className="mt-2 text-xl font-semibold tabular-nums text-slate-900">{value}</div>
          </div>
        ))}
      </section>

      {summary && (
        <section className="grid gap-4 md:grid-cols-2">
          <StatusBreakdown title="Pedidos por estado" data={summary.ordersByStatus} />
          <StatusBreakdown title="Envíos por estado" data={summary.shipmentsByStatus} />
        </section>
      )}

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-900">Últimos eventos consumidos</h2>
          <span className="text-xs text-slate-500">
            {summary ? `${summary.eventsProcessed} eventos · ${summary.duplicatesIgnored} duplicados ignorados` : ''}
          </span>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-500">
              <tr>
                <th className="px-4 py-2 font-medium">Hora</th>
                <th className="px-4 py-2 font-medium">Tópico · partición · offset</th>
                <th className="px-4 py-2 font-medium">Evento</th>
                <th className="px-4 py-2 font-medium">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                    Aún no hay eventos. Crea o actualiza un pedido o un envío para verlos llegar.
                  </td>
                </tr>
              )}
              {events.map((ev) => {
                const key = `${ev.topic}-${ev.partition}-${ev.offset}`;
                return (
                  <tr key={key} className={`border-t border-slate-100 transition-colors ${freshKeys.has(key) ? 'bg-emerald-50' : ''}`}>
                    <td className="px-4 py-2 tabular-nums text-slate-500">{formatTime(ev.occurredAt)}</td>
                    <td className="px-4 py-2 font-mono text-slate-600">
                      {ev.topic} · p{ev.partition} · #{ev.offset}
                    </td>
                    <td className="px-4 py-2">
                      <span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
                        <span className={`h-2 w-2 rounded-full ${STATUS_COLORS[ev.status] ?? 'bg-slate-400'}`} />
                        {ev.eventType}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-slate-600">{ev.detail}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

const StatusBreakdown: React.FC<{ title: string; data: Record<string, number> }> = ({ title, data }) => {
  const entries: [string, number][] = Object.keys(data)
    .map((status): [string, number] => [status, Number(data[status])])
    .sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((acc, [, n]) => acc + n, 0);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-slate-900">{title}</h2>
      {entries.length === 0 && <p className="text-xs text-slate-400">Sin datos todavía.</p>}
      <ul className="space-y-2">
        {entries.map(([status, count]) => (
          <li key={status} className="text-xs">
            <div className="mb-1 flex justify-between text-slate-600">
              <span>{status.replaceAll('_', ' ')}</span>
              <span className="tabular-nums font-medium text-slate-900">{count}</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100">
              <div
                className={`h-1.5 rounded-full ${STATUS_COLORS[status] ?? 'bg-slate-400'}`}
                style={{ width: `${total ? (count / total) * 100 : 0}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
