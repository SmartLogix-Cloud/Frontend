import { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { Database, ShieldCheck, LineChart, LogIn, RefreshCw } from 'lucide-react';
import { loginRequest } from '../auth/msalConfig';

/**
 * Pantalla de inicio de sesión con Microsoft Entra ID (OAuth 2.0 / OpenID Connect).
 * El botón dispara `loginRedirect`; al volver de Entra, MSAL deja la sesión activa
 * y App.tsx (vía useIsAuthenticated) muestra el panel. Ya no hay login propio.
 */
export default function Login() {
  const { instance } = useMsal();
  const [isLoading, setIsLoading] = useState(false);

  const handleMicrosoftLogin = async () => {
    setIsLoading(true);
    try {
      await instance.loginRedirect(loginRequest);
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex w-full min-h-screen bg-slate-50">
      {/* Panel de marca (solo desktop) */}
      <section className="hidden lg:flex w-1/2 bg-[#131b2e] relative overflow-hidden flex-col justify-center items-center p-12">
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute -top-[20%] -left-[20%] w-[80%] h-[80%] bg-[#006a61] rounded-full blur-[120px]"></div>
          <div className="absolute -bottom-[20%] -right-[20%] w-[80%] h-[80%] bg-[#bec6e0] rounded-full blur-[120px]"></div>
        </div>
        <div className="relative z-10 max-w-lg text-center flex flex-col items-center">
          <h1 className="text-3xl font-bold text-white tracking-tight leading-snug mb-4">
            Gestión logística de última generación.
          </h1>
          <p className="text-slate-300 text-base leading-relaxed max-w-md mx-auto">
            Optimiza tu cadena de suministro con precisión quirúrgica y datos en tiempo real.
          </p>
        </div>
        <div className="absolute bottom-6 left-8 right-8 flex justify-between px-4 opacity-50 text-[#7c839b]">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} />
            <span className="text-xs font-semibold tracking-wider uppercase">AUTENTICACIÓN ENTRA ID</span>
          </div>
          <div className="flex items-center gap-2">
            <LineChart size={16} />
            <span className="text-xs font-semibold tracking-wider uppercase">ANÁLISIS EN TIEMPO REAL</span>
          </div>
        </div>
      </section>

      {/* Lado derecho: inicio de sesión */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 bg-white">
        <div className="w-full max-w-[420px] flex flex-col gap-8">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-black rounded flex items-center justify-center shadow-md">
              <Database className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">SmartLogix</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1.5">Bienvenido a SmartLogix</h2>
            <p className="text-slate-500 text-sm">
              Inicia sesión con tu cuenta corporativa de Microsoft Entra ID para acceder al panel de control.
            </p>
          </div>

          <button
            onClick={handleMicrosoftLogin}
            disabled={isLoading}
            className="w-full bg-black hover:bg-slate-900 text-white py-3 px-6 rounded-lg text-sm font-bold shadow-sm hover:shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <RefreshCw className="animate-spin" size={18} />
                <span>Redirigiendo a Microsoft…</span>
              </>
            ) : (
              <>
                <LogIn size={18} />
                <span>Iniciar sesión con Microsoft</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Serás redirigido al portal seguro de Microsoft Entra ID. Tu acceso al panel depende del
            rol asignado (Admin, Operador o Cliente).
          </p>

          <footer className="pt-8 text-center border-t border-slate-100 text-[11px] font-medium text-slate-400">
            © 2026 SmartLogix Logistics Solutions
          </footer>
        </div>
      </section>
    </main>
  );
}
