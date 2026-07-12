import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App.tsx';
import GlitchTipDemo from './components/GlitchTipDemo.tsx';
import './index.css';

// Monitoreo de errores con GlitchTip (compatible con el SDK de Sentry).
// El DSN se hornea en build via Vite; si esta vacio, init() queda en no-op.
const dsn = import.meta.env.VITE_GLITCHTIP_DSN;
if (dsn) {
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<p>Ocurrió un error inesperado. Recarga la página.</p>}>
      <App />
      <GlitchTipDemo />
    </Sentry.ErrorBoundary>
  </StrictMode>,
);
