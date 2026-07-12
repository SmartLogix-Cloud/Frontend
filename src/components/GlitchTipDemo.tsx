import { useState } from 'react';

// Demostracion para la Letra G (registro de errores con GlitchTip).
// Al pulsar el boton, este hijo lanza un error en render que captura el
// Sentry.ErrorBoundary de main.tsx y reporta a GlitchTip. Solo para demo.
function Bomb() {
  throw new Error('[DEMO] Error de render capturado por el ErrorBoundary -> GlitchTip');
}

export default function GlitchTipDemo() {
  const [boom, setBoom] = useState(false);
  if (boom) return <Bomb />;

  return (
    <button
      type="button"
      onClick={() => setBoom(true)}
      title="Provoca un error para demostrar la captura en GlitchTip"
      style={{
        position: 'fixed',
        bottom: 12,
        right: 12,
        zIndex: 9999,
        padding: '6px 10px',
        fontSize: 12,
        background: '#b91c1c',
        color: '#fff',
        border: 'none',
        borderRadius: 6,
        cursor: 'pointer',
        opacity: 0.85,
      }}
    >
      GlitchTip: probar error
    </button>
  );
}
