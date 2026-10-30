import {
  Product,
  ShipmentDto,
  CreateShipmentPayload,
  UpdateShipmentStatusPayload,
  OrderDto,
} from '../types';
import { msalInstance, apiTokenRequest } from '../auth/msalConfig';
import { InteractionRequiredAuthError } from '@azure/msal-browser';

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

/** Extrae un mensaje legible de cualquier valor capturado en un catch. */
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return 'Error inesperado';
}

/**
 * Adquiere el Access Token (JWT) de Entra para el scope de la API.
 * Intenta en silencio (cache/refresh); si Entra exige interacción, redirige al login.
 */
async function getAccessToken(): Promise<string | null> {
  const account = msalInstance.getActiveAccount() ?? msalInstance.getAllAccounts()[0];
  if (!account) return null;
  try {
    const result = await msalInstance.acquireTokenSilent({ ...apiTokenRequest, account });
    return result.accessToken;
  } catch (err) {
    if (err instanceof InteractionRequiredAuthError) {
      await msalInstance.acquireTokenRedirect({ ...apiTokenRequest, account });
    }
    return null;
  }
}

interface ApiErrorBody {
  detail?: string;
  message?: string;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getAccessToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!response.ok) {
    let errorDetail = 'Error en la petición';
    try {
      const errBody = (await response.json()) as ApiErrorBody;
      errorDetail = errBody.detail || errBody.message || errorDetail;
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : null) as T;
}

export const api = {
  // --- Inventario ---
  async getProducts(): Promise<Product[]> {
    return request<Product[]>('/inventory/products-with-stock');
  },

  async createProduct(product: Partial<Product>): Promise<Product> {
    return request<Product>('/inventory/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  async deleteProduct(id: string): Promise<void> {
    await request<void>(`/inventory/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ active: false }),
    });
  },

  // Mapea a ms-inventory/stock/in o /out
  async adjustProductStock(
    productId: number | string,
    warehouseId: number | string,
    quantity: number,
    type: 'ENTRADA' | 'SALIDA'
  ): Promise<ShipmentDto | unknown> {
    const path = type === 'ENTRADA' ? '/inventory/stock/in' : '/inventory/stock/out';
    return request<unknown>(path, {
      method: 'POST',
      body: JSON.stringify({
        productId: Number(productId),
        warehouseId: Number(warehouseId),
        quantity: Math.abs(quantity),
        orderReference: 'Ajuste Manual UI',
      }),
    });
  },

  // --- Envíos ---
  async getShipments(): Promise<ShipmentDto[]> {
    return request<ShipmentDto[]>('/shipments');
  },

  async createShipment(shipment: CreateShipmentPayload): Promise<ShipmentDto> {
    return request<ShipmentDto>('/shipments', {
      method: 'POST',
      body: JSON.stringify(shipment),
    });
  },

  async updateShipmentStatus(
    id: string,
    payload: UpdateShipmentStatusPayload
  ): Promise<ShipmentDto> {
    return request<ShipmentDto>(`/shipments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  // --- Pedidos (ms-order) ---
  async getOrders(): Promise<OrderDto[]> {
    return request<OrderDto[]>('/orders');
  },

  // --- Dashboard ---
  async getDashboard(): Promise<Record<string, unknown>> {
    return request<Record<string, unknown>>('/dashboard');
  },
};
