// ============================================================
// Alias de unión reutilizables
// ============================================================
export type ProductCategory =
  | 'Electrónica'
  | 'Farmacéutico'
  | 'Automotriz'
  | 'Perecederos'
  | 'General';

export type ProductStatus = 'Disponible' | 'Bajo Stock' | 'Agotado';

export type ShipmentStatus = 'Entregado' | 'En Tránsito' | 'Pendiente' | 'Retrasado';

export type ShipmentPriority = 'Alta' | 'Media' | 'Baja';

export type LogType =
  | 'shipment_update'
  | 'inventory_alert'
  | 'system_info'
  | 'security_event';

/** Estados de envío tal como los expone el backend (ms-shipping). */
export type BackendShipmentState =
  | 'CREADO'
  | 'ASIGNADO'
  | 'EN_RUTA'
  | 'ENTREGADO'
  | 'INCIDENCIA';

// ============================================================
// Modelos de dominio (frontend)
// ============================================================
export interface Product {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  quantity: number;
  minStock: number;
  location: string; // e.g. "Pasillo A - Estante B3"
  status: ProductStatus;
  lastUpdated: string;
}

export interface ShipmentTimelineStep {
  status: string;
  location: string;
  timestamp: string;
  description: string;
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  carrier: string;
  status: ShipmentStatus;
  estimatedDelivery: string;
  itemsCount: number;
  weight: number; // in kg
  priority: ShipmentPriority;
  lastCoordinates?: { lat: number; lng: number };
  timeline: ShipmentTimelineStep[];
}

export interface WarehouseZone {
  id: string;
  name: string; // e.g., "Muelle Norte", "Cámara Fría A"
  capacity: number; // max slots
  occupied: number; // occupied slots
  temperature?: string;
  type: string;
}

export interface LogisticsLog {
  id: string;
  timestamp: string;
  type: LogType;
  message: string;
  operator: string;
}

export interface UserProfile {
  name: string;
  email: string;
  company: string;
  role: string;
}

// ============================================================
// DTOs del backend (formas crudas que devuelven los MS/BFF)
// ============================================================
export interface ShipmentTrackingDto {
  status?: string;
  location?: string;
  createdAt?: string;
  comment?: string;
}

/** Forma cruda de un envío tal como llega del BFF/ms-shipping. */
export interface ShipmentDto {
  shipmentId?: number;
  id?: number | string;
  trackingNumber?: string;
  district?: string;
  region?: string;
  destinationAddress?: string;
  destination?: string;
  carrierName?: string;
  status?: string;
  estimatedDate?: string;
  itemsCount?: number;
  weight?: number;
  priority?: ShipmentPriority;
  tracking?: ShipmentTrackingDto[];
}

export interface CreateShipmentPayload {
  orderId: number;
  carrierId?: number;
  trackingNumber?: string;
  destinationAddress: string;
  estimatedDate?: string;
}

export interface UpdateShipmentStatusPayload {
  status: string;
  location: string;
  comment: string;
}

// ============================================================
// Autenticación
// ============================================================
export interface AuthResponse {
  accessToken: string;
}

export interface JwtPayload {
  sub?: string;
  email?: string;
  name?: string;
  role?: string;
  scope?: string;
  exp?: number;
}

// ============================================================
// AI Hub
// ============================================================
export interface OptimizationReport {
  trackingNumber: string;
  origin: string;
  destination: string;
  carrier: string;
  originalDistance: string;
  optimizedDistance: string;
  fuelSavings: string;
  timeSavings: string;
  alternativeNodes: string[];
  rationale: string;
}

export type ChatSender = 'user' | 'ia';

export interface ChatMessage {
  sender: ChatSender;
  text: string;
  time: string;
}
