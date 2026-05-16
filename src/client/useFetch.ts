import { useEffect, useState, useCallback } from "react";
import { apiClient, ApiError } from "./apiClient.js";

export type FetchState<T> =
  | { status: "loading" }
  | { status: "ok"; data: T }
  | { status: "error"; message: string };

// Hook minimo para GETs idempotentes con loading/error/reload.
// Re-ejecuta el fetch cuando cambia `path`. El reload manual aumenta un nonce.
export function useFetch<T>(path: string | null): FetchState<T> & { reload: () => void } {
  const [state, setState] = useState<FetchState<T>>({ status: "loading" });
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    if (path === null) {
      return;
    }
    const controller = new AbortController();
    setState({ status: "loading" });

    apiClient.get<T>(path, { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return;
        setState({ status: "ok", data });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const message = err instanceof ApiError
          ? `${err.status} — ${err.message}`
          : (err as Error).message;
        setState({ status: "error", message });
      });

    return () => controller.abort();
  }, [path, nonce]);

  return { ...state, reload };
}
