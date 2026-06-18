import { Product, Shipment, UserProfile } from '../types';

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

export function parseJwt(token: string): any {
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
    return JSON.parse(jsonPayload);
  } catch (e) {
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

async function request(path: string, options: RequestInit = {}): Promise<any> {
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
      const errBody = await response.json();
      errorDetail = errBody.detail || errBody.message || errorDetail;
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export const api = {
  async login(email: string, password: string): Promise<{ accessToken: string }> {
    const response = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (response?.accessToken) {
      setStoredToken(response.accessToken);
    }
    return response;
  },

  async register(name: string, email: string, password: string): Promise<void> {
    await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  async getProducts(): Promise<Product[]> {
    return request('/inventario/productos-con-stock');
  },

  async createProduct(product: Partial<Product>): Promise<Product> {
    return request('/inventario/productos', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  async deleteProduct(id: string): Promise<void> {
    await request(`/inventario/productos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ activo: false }),
    });
  },

  // Map to ms-inventory/stock/entrada or salida
  async adjustProductStock(idProducto: number | string, idBodega: number | string, cantidad: number, tipo: 'ENTRADA' | 'SALIDA'): Promise<any> {
    const path = tipo === 'ENTRADA' ? '/inventario/stock/entrada' : '/inventario/stock/salida';
    return request(path, {
      method: 'POST',
      body: JSON.stringify({
        idProducto: Number(idProducto),
        idBodega: Number(idBodega),
        cantidad: Math.abs(cantidad),
        referenciaPedido: 'Ajuste Manual UI'
      }),
    });
  },

  async getShipments(): Promise<any[]> {
    return request('/envios');
  },

  async createShipment(shipment: { idPedido: number; idTransportista: number; trackingNumber?: string; direccionDestino: string; fechaEstimada?: string }): Promise<any> {
    return request('/envios', {
      method: 'POST',
      body: JSON.stringify(shipment),
    });
  },

  async updateShipmentStatus(id: string, payload: { estado: string; ubicacion: string; comentario: string }): Promise<any> {
    return request(`/envios/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async getDashboard(): Promise<any> {
    return request('/dashboard');
  }
};
