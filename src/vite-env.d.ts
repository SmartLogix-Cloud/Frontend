/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL del API (gateway/BFF). Por defecto '/api'. */
  readonly VITE_API_BASE?: string;
  /** API key de Google Gemini para el AI Hub. Si está ausente, el AI Hub usa el modo simulado. */
  readonly VITE_GEMINI_API_KEY?: string;
  /** DSN de GlitchTip para el error tracking. Si está ausente, Sentry.init queda en no-op. */
  readonly VITE_GLITCHTIP_DSN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
