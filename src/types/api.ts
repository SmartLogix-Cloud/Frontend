// Tipos del contrato con el BFF / microservicios.
// Espejan los records Java de los DTOs en backend/microservices/*/dto/.
// Fechas viajan como ISO 8601 (string) en el wire format JSON.

// ============================================================
// ms-pedido
// ============================================================

export type EstadoPedido =
  | "PENDIENTE"
  | "APROBADO"
  | "EN_PREPARACION"
  | "ENVIADO"
  | "ENTREGADO"
  | "RECHAZADO"
  | "CANCELADO";

export type TipoPedido = "ESTANDAR" | "EXPRESS";

export interface PedidoItem {
  idItem: number;
  idProducto: number;
  sku: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Pedido {
  idPedido: number;
  codigo: string;
  tipo: TipoPedido;
  estado: EstadoPedido;
  idCliente: string;
  idMarketplace: string | null;
  subtotal: number;
  impuesto: number;
  total: number;
  items: PedidoItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CrearPedidoRequest {
  tipo?: TipoPedido;
  idCliente: string;
  idMarketplace?: string;
  items: Array<{
    idProducto: number;
    sku: string;
    cantidad: number;
    precioUnitario: number;
  }>;
}

export interface ActualizarEstadoPedidoRequest {
  estado: EstadoPedido;
  motivo?: string;
}

// ============================================================
// ms-inventario
// ============================================================

export interface Producto {
  idProducto: number;
  sku: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Bodega {
  idBodega: number;
  nombre: string;
  ubicacion: string | null;
  activo: boolean;
}

export interface Stock {
  idStock: number;
  idProducto: number;
  sku: string;
  idBodega: number;
  bodega: string;
  cantidad: number;
  cantReservada: number;
  disponible: number;
  stockMinimo: number;
  updatedAt: string;
}

export interface MovimientoStockRequest {
  idProducto: number;
  idBodega: number;
  cantidad: number;
  referenciaPedido?: string;
}

// ============================================================
// ms-envio
// ============================================================

export type EstadoEnvio =
  | "CREADO"
  | "ASIGNADO"
  | "EN_RUTA"
  | "ENTREGADO"
  | "INCIDENCIA";

export interface Transportista {
  idTransportista: number;
  nombre: string;
  rut: string | null;
  telefonoContacto: string | null;
  activo: boolean;
}

export interface SeguimientoEnvio {
  idSeguimiento: number;
  estado: EstadoEnvio;
  ubicacion: string | null;
  comentario: string | null;
  createdAt: string;
}

export interface Envio {
  idEnvio: number;
  idPedido: number;
  idTransportista: number | null;
  transportistaNombre: string | null;
  trackingNumber: string;
  estado: EstadoEnvio;
  direccionDestino: string;
  comuna: string | null;
  region: string | null;
  fechaEstimada: string | null;
  fechaEntrega: string | null;
  seguimiento: SeguimientoEnvio[];
  createdAt: string;
  updatedAt: string;
}

export interface CrearEnvioRequest {
  idPedido: number;
  direccionDestino: string;
  comuna?: string;
  region?: string;
  fechaEstimada?: string;
}

export interface ActualizarEstadoEnvioRequest {
  estado: EstadoEnvio;
  ubicacion?: string;
  comentario?: string;
}

// ============================================================
// BFF endpoints compuestos
// ============================================================

// GET /dashboard - ver bff/src/services/dashboardService.js
export interface DashboardResponse {
  pedidos: Record<EstadoPedido, number | null>;
  stockBajo: { total: number; items: Stock[] };
  enviosEnRuta: { total: number; items: Envio[] };
  generatedAt: string;
}

// GET /pedidos/:id/full - ver bff/src/services/pedidoComposerService.js
export interface PedidoFull extends Pedido {
  envios: Envio[];
  disponibilidad: Array<{
    idProducto: number;
    disponible: number | null;
  }>;
}

// POST /checkout - ver bff/src/schemas/checkout.js
export interface CheckoutRequest {
  idCliente: string;
  idMarketplace?: string;
  tipo?: TipoPedido;
  idBodega: number;
  envio: {
    direccionDestino: string;
    comuna?: string;
    region?: string;
    fechaEstimada?: string;
  };
  items: Array<{
    idProducto: number;
    sku: string;
    cantidad: number;
    precioUnitario: number;
  }>;
}

export interface CheckoutResponse {
  pedido: Pedido;
  envio: Envio;
  reservas: Array<{ idProducto: number; cantidad: number; status: "ok" | "rolled-back" | "failed" }>;
}

// ============================================================
// RFC 7807 Problem Detail (errores del BFF y MS)
// ============================================================

export interface ProblemDetail {
  type?: string;
  title?: string;
  status: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string>; // validación zod / Bean Validation
  [extra: string]: unknown;
}
