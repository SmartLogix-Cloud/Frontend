import {
  Product,
  UserProfile,
  AuthResponse,
  JwtPayload,
  ShipmentDto,
  CreateShipmentPayload,
  UpdateShipmentStatusPayload,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

export function getStoredToken(): string | null {
  return localStorage.getItem('token');
}

export function setStoredToken(token: string) {
  localStorage.setItem('token', token);
}

export function removeStoredToken() {
  localStorage.removeItem('token');
}

/** Extrae un mensaje legible de cualquier valor capturado en un catch. */
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return 'Error inesperado';
}

export function parseJwt(token: string): JwtPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload) as JwtPayload;
  } catch {
    return null;
  }
}

export function getUserProfileFromToken(token: string): UserProfile | null {
  const payload = parseJwt(token);
  if (!payload) return null;
  return {
    name: payload.name || 'Usuario',
    email: payload.sub || payload.email || '',
    company: 'SmartLogix Partner',
    role: payload.role || 'USER',
  };
}

interface ApiErrorBody {
  detail?: string;
  message?: string;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

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
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (response?.accessToken) {
      setStoredToken(response.accessToken);
    }
    return response;
  },

  async register(name: string, email: string, password: string): Promise<void> {
    await request<void>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

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

  // Map to ms-inventory/stock/in or out
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

  async getDashboard(): Promise<Record<string, unknown>> {
    return request<Record<string, unknown>>('/dashboard');
  },
};
