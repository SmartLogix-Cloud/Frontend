import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Database, 
  ShieldCheck, 
  LineChart, 
  RefreshCw,
  Key,
  Globe,
  User,
  Building2
} from 'lucide-react';
import { UserProfile } from '../types';

interface LoginProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('Director de Operaciones');
  
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Auto fill credentials helper for seamless exploration
  const prefillCredentials = (roleType: 'admin' | 'guest') => {
    setErrorMsg('');
    if (roleType === 'admin') {
      setEmail('nombre@empresa.com');
      setPassword('admin12345');
      setName('Eduardo Silva');
      setCompany('LogixCorp Global');
      setRole('Director de Operaciones');
    } else {
      setEmail('invitado@smartlogix.com');
      setPassword('invitado321');
      setName('Laura Mendoza');
      setCompany('SmartLogix Solutions');
      setRole('Analista de Distribución');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email) {
      setErrorMsg('El correo corporativo es obligatorio.');
      return;
    }
    if (!password) {
      setErrorMsg('La contraseña es obligatoria.');
      return;
    }
    if (isSignUp && (!name || !company)) {
      setErrorMsg('Por favor completa todos los campos de registro.');
      return;
    }

    setIsLoading(true);

    // Simulate authenticating
    setTimeout(() => {
      setIsLoading(false);
      if (isSignUp) {
        setSuccessMsg('¡Registro exitoso! Ya puedes iniciar sesión.');
        setIsSignUp(false);
        setPassword('');
      } else {
        // Log in
        const authenticatedUser: UserProfile = {
          name: name || (email === 'invitado@smartlogix.com' ? 'Laura Mendoza' : 'Eduardo Silva'),
          email: email,
          company: company || (email === 'invitado@smartlogix.com' ? 'SmartLogix' : 'LogixCorp Global'),
          role: email === 'invitado@smartlogix.com' ? 'Analista de Distribución' : role
        };
        onLoginSuccess(authenticatedUser);
      }
    }, 1500);
  };

  return (
    <main className="flex w-full min-h-screen bg-slate-50">
      
      {/* Left Side: Interactive Branding/Visual (Desktop Only) */}
      <section className="hidden lg:flex w-1/2 bg-[#131b2e] relative overflow-hidden flex-col justify-center items-center p-12">
        {/* Background Light Gradients */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute -top-[20%] -left-[20%] w-[80%] h-[80%] bg-[#006a61] rounded-full blur-[120px]"></div>
          <div className="absolute -bottom-[20%] -right-[20%] w-[80%] h-[80%] bg-[#bec6e0] rounded-full blur-[120px]"></div>
        </div>

        <div className="relative z-10 max-w-lg text-center flex flex-col items-center">
          <div className="mb-8 w-full max-w-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            >
              <img 
                alt="Logistics Excellence" 
                className="w-full h-80 object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAshBDIKh5rreU_vBYqjRM3AOW8wIjZLWzqyYKsJ8_U_hz3CbVh2NIZ-d_q8WK7VTq0tJpB6gg4BQeWC916UQBbUA6eTddFmxgjJC3-XJEPQhgC3xxJh__lKtzUnZpq1Opu3jDOnHIBGj7jTM8etxR_wi5GuGs7iNCBubQTEms0Yj0IW4FTvrqsRZr2NgWpbPHcsCZeFym3NZ71GA01jxzb8tGkvGw9UfIZNu1RrS-ZWS6G4iJHnD9TqIWN0u6rfjNgCOnFoLoJB7mq"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#131b2e]/80 via-transparent to-transparent"></div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold text-white tracking-tight leading-snug mb-4">
              Gestión logística de última generación.
            </h1>
            <p className="text-slate-300 text-base leading-relaxed max-w-md mx-auto">
              Optimiza tu cadena de suministro con precisión quirúrgica y datos en tiempo real.
            </p>
          </motion.div>
        </div>

        {/* Floating Data Elements (Visual Interest) */}
        <div className="absolute bottom-6 left-8 right-8 flex justify-between px-4 opacity-50 text-[#7c839b]">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} />
            <span className="text-xs font-semibold tracking-wider uppercase">SEGURIDAD NIVEL BANCARIO</span>
          </div>
          <div className="flex items-center gap-2">
            <LineChart size={16} />
            <span className="text-xs font-semibold tracking-wider uppercase">ANÁLISIS EN TIEMPO REAL</span>
          </div>
        </div>
      </section>

      {/* Right Side: Login / Registration Form */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-8 xs:p-12 md:p-16 bg-white shadow-xl lg:shadow-none">
        <div className="w-full max-w-[440px] flex flex-col justify-between h-full min-h-[580px]">
          
          {/* Top block */}
          <div>
            {/* Brand Anchor */}
            <div className="mb-6 flex xl:flex-row flex-col justify-between xl:items-center gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-black rounded flex items-center justify-center shadow-md">
                  <Database className="text-white" size={20} />
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900">SmartLogix</span>
              </div>
              
              {/* Demo Helper Pill */}
              <div className="flex gap-1.5 self-start">
                <button 
                  onClick={() => prefillCredentials('admin')}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors border border-slate-200"
                  type="button"
                  title="Rellenar datos de Administrador"
                >
                  Demo Admin
                </button>
                <button 
                  onClick={() => prefillCredentials('guest')}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-teal-50 hover:bg-teal-100 text-teal-800 transition-colors border border-teal-100"
                  type="button"
                  title="Rellenar datos de Invitado"
                >
                  Demo Logístico
                </button>
              </div>
            </div>

            {/* Form Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-1.5">
                {isSignUp ? 'Crea tu cuenta SmartLogix' : 'Bienvenido a SmartLogix'}
              </h2>
              <p className="text-slate-500 text-sm">
                {isSignUp 
                  ? 'Registra tus datos para unirse a la plataforma logística' 
                  : 'Ingresa tus credenciales para acceder al panel de control'}
              </p>
            </div>

            {/* Error or Success Toast */}
            <AnimatePresence mode="wait">
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs font-medium flex items-start gap-2.5"
                >
                  <span className="mt-0.5 font-bold">⚠️</span>
                  <span>{errorMsg}</span>
                </motion.div>
              )}
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-medium flex items-start gap-2.5"
                >
                  <span className="mt-0.5 font-bold">✓</span>
                  <span>{successMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {isSignUp && (
                <>
                  {/* Name field */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold tracking-wider text-slate-500 uppercase block" htmlFor="name">
                      NOMBRE COMPLETO
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="ej. Eduardo Silva"
                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-slate-100 focus:border-slate-800 outline-none transition-all placeholder:text-slate-300"
                        type="text"
                      />
                    </div>
                  </div>

                  {/* Company field */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold tracking-wider text-slate-500 uppercase block" htmlFor="company">
                      COMPAÑÍA / EMPRESA
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        id="company"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="ej. LogixCorp Global"
                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-slate-100 focus:border-slate-800 outline-none transition-all placeholder:text-slate-300"
                        type="text"
                      />
                    </div>
                  </div>

                  {/* Role picker dropdown */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold tracking-wider text-slate-500 uppercase block" htmlFor="role">
                      ROL LOGÍSTICO
                    </label>
                    <select
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-slate-100 focus:border-slate-800 outline-none transition-all"
                    >
                      <option value="Director de Operaciones">Director de Operaciones</option>
                      <option value="Gerente de Inventarios">Gerente de Inventarios</option>
                      <option value="Supervisor de Despacho">Supervisor de Despacho</option>
                      <option value="Analista de Distribución">Analista de Distribución</option>
                    </select>
                  </div>
                </>
              )}

              {/* Email Field */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold tracking-wider text-slate-500 uppercase block" htmlFor="email">
                  EMAIL CORPORATIVO
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nombre@empresa.com"
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-slate-100 focus:border-slate-800 outline-none transition-all placeholder:text-slate-300"
                    type="email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold tracking-wider text-slate-500 uppercase block" htmlFor="password">
                    CONTRASEÑA
                  </label>
                  {!isSignUp && (
                    <button 
                      onClick={() => alert('Simulado: Se ha enviado un enlace de restauración a tu correo.')}
                      className="text-[11px] font-bold tracking-tight text-[#006a61] hover:text-[#005049] transition-colors"
                      type="button"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-slate-100 focus:border-slate-800 outline-none transition-all placeholder:text-slate-300"
                    type={showPassword ? 'text' : 'password'}
                  />
                  <button 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-800 transition-colors"
                    type="button"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember & CTA */}
              {!isSignUp && (
                <div className="flex items-center gap-2 py-1">
                  <input 
                    type="checkbox" 
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-black focus:ring-black cursor-pointer"
                  />
                  <label htmlFor="remember" className="text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer select-none">
                    Recordarme
                  </label>
                </div>
              )}

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-black hover:bg-slate-900 text-white py-3 px-6 rounded-lg text-xs font-bold shadow-sm hover:shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed uppercase tracking-wider"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="animate-spin" size={16} />
                    <span>Autenticando...</span>
                  </div>
                ) : (
                  <>
                    <span>{isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Separator "O CONTINUAR CON" */}
            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs font-bold text-slate-400 tracking-wider">
                <span className="px-4 bg-white uppercase">O CONTINUAR CON</span>
              </div>
            </div>

            {/* SSO & Digital ID Buttons */}
            <div className="grid grid-cols-2 gap-3.5">
              <button 
                onClick={() => {
                  setIsLoading(true);
                  setTimeout(() => {
                    setIsLoading(false);
                    onLoginSuccess({
                      name: 'Carlos SSO',
                      email: 'carlos@sso-logix.com',
                      company: 'Socio Autenticado',
                      role: 'Director de Operaciones'
                    });
                  }, 1000);
                }}
                className="flex items-center justify-center gap-2.5 py-2.5 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Globe size={14} className="text-slate-400" />
                <span>SSO Corporativo</span>
              </button>
              
              <button 
                onClick={() => {
                  setIsLoading(true);
                  setTimeout(() => {
                    setIsLoading(false);
                    onLoginSuccess({
                      name: 'Mariana ID',
                      email: 'mariana@digital-id.com',
                      company: 'Verificado Digital',
                      role: 'Analista de Distribución'
                    });
                  }, 1000);
                }}
                className="flex items-center justify-center gap-2.5 py-2.5 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Key size={14} className="text-slate-400" />
                <span>Digital ID</span>
              </button>
            </div>

            {/* Switch mode */}
            <div className="text-center mt-6">
              <p className="text-xs font-medium text-slate-500">
                {isSignUp ? '¿Ya tienes una cuenta?' : '¿No tienes una cuenta?'} {' '}
                <button 
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-[#006a61] font-bold hover:underline underline-offset-4"
                >
                  {isSignUp ? 'Regístrate/Inicia sesión aquí' : 'Regístrate aquí'}
                </button>
              </p>
            </div>
          </div>

          {/* Footer block (Compliance) */}
          <footer className="pt-8 text-center border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] font-medium text-slate-400">
            <span>© 2024 SmartLogix Logistics Solutions</span>
            <div className="flex gap-4">
              <a className="hover:text-slate-600 transition-colors cursor-pointer" href="#">Privacidad</a>
              <a className="hover:text-slate-600 transition-colors cursor-pointer" href="#">Términos</a>
            </div>
          </footer>

        </div>
      </section>

    </main>
  );
}
