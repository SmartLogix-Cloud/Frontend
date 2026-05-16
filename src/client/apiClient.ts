// Cliente HTTP unico contra el BFF.
//
// Convenciones:
// - URL base configurable via VITE_API_BASE. Default '/api' (proxy de Vite en dev).
//   En produccion, mismo '/api' bajo nginx o absoluto a http://bff.smartlogix.localhost.
// - Timeout por defecto 8000 ms (el BFF usa 5000 contra MS; damos margen).
// - Errores tipados como ApiError con status + body parseado como ProblemDetail si aplica.

import type { ProblemDetail } from "../types/api.js";

const DEFAULT_TIMEOUT_MS = 8000;

const API_BASE: string =
  (import.meta.env.VITE_API_BASE as string | undefined) ?? "/api";

export class ApiError extends Error {
  readonly status: number;
  readonly problem: ProblemDetail | null;
  readonly body: unknown;

  constructor(message: string, init: { status: number; problem?: ProblemDetail | null; body?: unknown }) {
    super(message);
    this.name = "ApiError";
    this.status = init.status;
    this.problem = init.problem ?? null;
    this.body = init.body;
  }
}

interface RequestOptions {
  timeoutMs?: number;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

async function request<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
  opts: RequestOptions = {},
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  // Si el caller pasa su propio signal, lo encadenamos al nuestro.
  if (opts.signal) {
    opts.signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  try {
    const init: RequestInit = {
      method,
      headers: {
        "Accept": "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(opts.headers ?? {}),
      },
      signal: controller.signal,
    };
    if (body !== undefined) {
      init.body = JSON.stringify(body);
    }
    const res = await fetch(url, init);

    const text = await res.text();
    const parsed = text ? safeJson(text) : null;

    if (!res.ok) {
      const problem = isProblemDetail(parsed) ? parsed : null;
      const message =
        problem?.detail ??
        problem?.title ??
        `${method} ${path} respondio ${res.status}`;
      throw new ApiError(message, { status: res.status, problem, body: parsed });
    }

    // 204 No Content u otros sin cuerpo
    return (parsed ?? (undefined as unknown)) as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if ((err as { name?: string }).name === "AbortError") {
      throw new ApiError(`${method} ${path} timeout`, { status: 408 });
    }
    throw new ApiError(`${method} ${path} red inalcanzable: ${(err as Error).message}`, { status: 0 });
  } finally {
    clearTimeout(timeout);
  }
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function isProblemDetail(x: unknown): x is ProblemDetail {
  return typeof x === "object" && x !== null && typeof (x as ProblemDetail).status === "number";
}

export const apiClient = {
  get: <T>(path: string, opts?: RequestOptions) => request<T>("GET", path, undefined, opts),
  post: <T, B = unknown>(path: string, body: B, opts?: RequestOptions) => request<T>("POST", path, body, opts),
  patch: <T, B = unknown>(path: string, body: B, opts?: RequestOptions) => request<T>("PATCH", path, body, opts),
  del: <T>(path: string, opts?: RequestOptions) => request<T>("DELETE", path, undefined, opts),
};

export { API_BASE };
