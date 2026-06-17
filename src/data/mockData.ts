import { Product, Shipment, LogisticsLog } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Sensores Láser LiDAR',
    sku: 'ELE-4821-SL',
    category: 'Electrónica',
    quantity: 140,
    minStock: 25,
    location: 'Pasillo A - Estante B3',
    status: 'Disponible',
    lastUpdated: '2026-06-05'
  },
  {
    id: 'prod-2',
    name: 'Vacunas Temperatura Controlada',
    sku: 'FAR-9904-SL',
    category: 'Farmacéutico',
    quantity: 12,
    minStock: 30,
    location: 'Cámara Fría B3 - Estante C1',
    status: 'Bajo Stock',
    lastUpdated: '2026-06-06'
  },
  {
    id: 'prod-3',
    name: 'Circuitos Integrados CMOS',
    sku: 'ELE-2083-SL',
    category: 'Electrónica',
    quantity: 450,
    minStock: 50,
    location: 'Pasillo A - Estante A1',
    status: 'Disponible',
    lastUpdated: '2026-06-04'
  },
  {
    id: 'prod-4',
    name: 'Ejes para Chasis de Acero',
    sku: 'AUT-7023-SL',
    category: 'Automotriz',
    quantity: 0,
    minStock: 15,
    location: 'Zona de Carga General O1 - Estante D2',
    status: 'Agotado',
    lastUpdated: '2026-06-02'
  },
  {
    id: 'prod-5',
    name: 'Arándanos Orgánicos Premium',
    sku: 'PER-5510-SL',
    category: 'Perecederos',
    quantity: 80,
    minStock: 20,
    location: 'Cámara Fría B3 - Estante A4',
    status: 'Disponible',
    lastUpdated: '2026-06-05'
  },
  {
    id: 'prod-6',
    name: 'Contenedores de Polímeros',
    sku: 'GEN-3381-SL',
    category: 'General',
    quantity: 320,
    minStock: 40,
    location: 'Muelle Central A - Estante B2',
    status: 'Disponible',
    lastUpdated: '2026-06-06'
  }
];

export const INITIAL_SHIPMENTS: Shipment[] = [
  {
    id: 'ship-1',
    trackingNumber: 'SL-589230',
    origin: 'Santiago de Chile, CL',
    destination: 'Buenos Aires, AR',
    carrier: 'FedLogix International',
    status: 'En Tránsito',
    estimatedDelivery: '2026-06-08',
    itemsCount: 12,
    weight: 2400,
    priority: 'Alta',
    timeline: [
      {
        status: 'Tránsito de Carretera',
        location: 'Paso Fronterizo Los Libertadores',
        timestamp: '2026-06-06 14:30',
        description: 'Vehículo reporta cruce de aduana verificado de manera exitosa.'
      },
      {
        status: 'Despacho Inicial',
        location: 'Santiago de Chile, CL',
        timestamp: '2026-06-05 09:15',
        description: 'Lote clasificado y cargado en el muelle de exportaciones general.'
      }
    ]
  },
  {
    id: 'ship-2',
    trackingNumber: 'SL-702139',
    origin: 'Lima, PE',
    destination: 'Bogotá, CO',
    carrier: 'DHS Express',
    status: 'Retrasado',
    estimatedDelivery: '2026-06-07',
    itemsCount: 6,
    weight: 950,
    priority: 'Alta',
    timeline: [
      {
        status: 'Alerta de Demora',
        location: 'Centro de Distribución Quito',
        timestamp: '2026-06-06 11:20',
        description: 'Congestión vial debido a mantenimiento de carretera interprovincial.'
      },
      {
        status: 'En Ruta',
        location: 'Guayaquil, EC',
        timestamp: '2026-06-05 13:40',
        description: 'El transportista DHS Express continuó el tránsito después de reabastecimiento.'
      }
    ]
  },
  {
    id: 'ship-3',
    trackingNumber: 'SL-441209',
    origin: 'São Paulo, BR',
    destination: 'Montevideo, UY',
    carrier: 'SmartFreight CL',
    status: 'Entregado',
    estimatedDelivery: '2026-06-05',
    itemsCount: 4,
    weight: 180,
    priority: 'Baja',
    timeline: [
      {
        status: 'Entregado con Éxito',
        location: 'Montevideo, UY',
        timestamp: '2026-06-05 17:30',
        description: 'Mercancía recibida a conformidad por el operador de control local.'
      },
      {
        status: 'Despacho de Origen',
        location: 'São Paulo, BR',
        timestamp: '2026-06-03 10:00',
        description: 'Lote aprobado y firmado en muelle este de embarques.'
      }
    ]
  },
  {
    id: 'ship-4',
    trackingNumber: 'SL-993214',
    origin: 'Guayaquil, EC',
    destination: 'Santiago de Chile, CL',
    carrier: 'CargoNorte S.A.',
    status: 'Pendiente',
    estimatedDelivery: '2026-06-09',
    itemsCount: 18,
    weight: 4100,
    priority: 'Media',
    timeline: [
      {
        status: 'Orden en Espera',
        location: 'Guayaquil, EC',
        timestamp: '2026-06-06 15:00',
        description: 'Orden de carga confirmada. Vehículo asignado para pick-up.'
      }
    ]
  }
];

export const INITIAL_LOGS: LogisticsLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-06-06 15:12',
    type: 'shipment_update',
    message: 'Envío SL-589230 reporta paso exitoso de aduana Los Andes.',
    operator: 'Eduardo Silva'
  },
  {
    id: 'log-2',
    timestamp: '2026-06-06 14:45',
    type: 'inventory_alert',
    message: 'Alerta crítica de Stock: El lote FAR-9904-SL (Vacunas) descendió por debajo del stock de seguridad.',
    operator: 'Laura Mendoza'
  },
  {
    id: 'log-3',
    timestamp: '2026-06-06 13:00',
    type: 'security_event',
    message: 'Sistema SmartLogix reporta sincronización RFID exitosa en muelle central A.',
    operator: 'Servicio Web'
  },
  {
    id: 'log-4',
    timestamp: '2026-06-06 11:22',
    type: 'shipment_update',
    message: 'Envío SL-702139 (Lima ➔ Bogotá) reporta desvío climatológico en nodo Quito.',
    operator: 'Agente DHL'
  }
];
