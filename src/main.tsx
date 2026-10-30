import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import { MsalProvider } from '@azure/msal-react';
import App from './App.tsx';
import GlitchTipDemo from './components/GlitchTipDemo.tsx';
import { msalInstance } from './auth/msalConfig';
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

/**
 * Arranque: MSAL debe inicializarse y procesar la respuesta del redirect de login
 * ANTES de renderizar la app (así el apiClient ya tiene la cuenta activa).
 */
async function bootstrap() {
  await msalInstance.initialize();

  // Si volvemos de un login por redirect, toma la cuenta resultante.
  const response = await msalInstance.handleRedirectPromise();
  if (response?.account) {
    msalInstance.setActiveAccount(response.account);
  } else if (!msalInstance.getActiveAccount()) {
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      msalInstance.setActiveAccount(accounts[0]);
    }
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Sentry.ErrorBoundary fallback={<p>Ocurrió un error inesperado. Recarga la página.</p>}>
        <MsalProvider instance={msalInstance}>
          <App />
          <GlitchTipDemo />
        </MsalProvider>
      </Sentry.ErrorBoundary>
    </StrictMode>,
  );
}

bootstrap();
