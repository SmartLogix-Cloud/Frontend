// src/services/apiClient.ts - Versión TypeScript

// 1. Definimos el "contrato" de datos para un envío según tu foto
export interface Envio {
  id: number;
  idSeguimiento: string; // Ej: TRK-98234-A
  transportista: {
    nombre: string;
    avatar: string; // Iniciales
  };
  destino: string;
  tiempoEstimado: string;
  estado: 'En Tránsito' | 'Pendiente' | 'Entregado'; // Tipos estrictos
}

// 2. Definimos la URL base que ya tenían
const API_BASE = import.meta.env.VITE_API_BASE || "http://api.smartlogix.localhost";

// 3. El Cliente/Service, ahora tipado
export const apiClient = {
  // <T> significa que esta función es genérica y puede devolver cualquier tipo
  get: async <T>(endpoint: string): Promise<T> => {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`);
      if (!response.ok) throw new Error(`Error en la llamada: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error en el Client:", error);
      throw error;
    }
  },
};