export interface Product {
  id: string;
  name: string;
  sku: string;
  category: 'Electrónica' | 'Farmacéutico' | 'Automotriz' | 'Perecederos' | 'General';
  quantity: number;
  minStock: number;
  location: string; // e.g. "Pasillo A - Estante B3"
  status: 'Disponible' | 'Bajo Stock' | 'Agotado';
  lastUpdated: string;
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  carrier: string;
  status: 'Entregado' | 'En Tránsito' | 'Pendiente' | 'Retrasado';
  estimatedDelivery: string;
  itemsCount: number;
  weight: number; // in kg
  priority: 'Alta' | 'Media' | 'Baja';
  lastCoordinates?: { lat: number; lng: number };
  timeline: {
    status: string;
    location: string;
    timestamp: string;
    description: string;
  }[];
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
  type: 'shipment_update' | 'inventory_alert' | 'system_info' | 'security_event';
  message: string;
  operator: string;
}

export interface UserProfile {
  name: string;
  email: string;
  company: string;
  role: string;
}
