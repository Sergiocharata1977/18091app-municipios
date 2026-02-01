'use client';

import { useAuth } from '@/contexts/AuthContext';
import { signIn } from '@/firebase/auth';
import {
    Building2,
    ChevronRight,
    Eye,
    EyeOff,
    LayoutDashboard,
    Lock,
    Mail,
    ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  // Get the return URL from query params, default to dashboard
  const returnUrl = searchParams.get('returnUrl') || '/dashboard';

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push(returnUrl);
    }
  }, [user, authLoading, router, returnUrl]);

  const mapFirebaseError = (code: string) => {
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Credenciales incorrectas. Por favor verifica tu correo y contraseña.';
      case 'auth/too-many-requests':
        return 'Demasiados intentos fallidos. Por favor espera unos minutos.';
      case 'auth/user-disabled':
        return 'Esta cuenta ha sido deshabilitada.';
      default:
        return 'Ocurrió un error al iniciar sesión. Inténtalo de nuevo.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn(email, password);

      if (!result.success || !result.user) {
        throw new Error(result.error || 'Error desconocido');
      }

      // --- Post-Login Verification Logic ---
      
      // Fetch extended user data for role/status checks
      const userResponse = await fetch(`/api/users/${result.user.uid}`);
      
      if (!userResponse.ok) {
        console.warn('[Login] No se pudo obtener datos extendidos del usuario');
        // We might choose to let them pass or block them here. 
        // For now, let's proceed but warn.
      } else {
        const userData = await userResponse.json();
        const { organization_id, status, rol, expirationDate } = userData;

        // 1. Status Check: Pending
        if (status === 'pending_approval' && rol !== 'super_admin') {
          router.push('/pending'); 
          return;
        }

        // 2. Status Check: Expired (Manual Status)
        if (status === 'expired' && rol !== 'super_admin') {
          router.push('/dashboard/subscription');
          return;
        }

        // 3. Status Check: Expired (Date based)
        if (expirationDate && rol !== 'super_admin') {
          const expDate = new Date(expirationDate);
          if (expDate < new Date()) {
            router.push('/dashboard/subscription'); // TODO: Ensure this route exists
            return;
          }
        }

        // 4. Organization Context
        if (organization_id) {
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('organization_id', organization_id);
          }
        } else {
          console.warn('[Login] Usuario sin organización asignada');
        }
      }

      // Success Redirect
      router.push(returnUrl);

    } catch (err: any) {
      console.error('[Login Error]', err);
      // If the error string contains specific firebase codes, map them manually
      // or rely on the helper if the error object structure allows
      const errorMessage = typeof err === 'string' ? err : err.message || JSON.stringify(err);
      
      // Simple Includes check for common codes if they appear in the message string
      if (errorMessage.includes('invalid-credential') || errorMessage.includes('wrong-password')) {
        setError('Credenciales incorrectas.');
      } else {
        setError('No se pudo iniciar sesión. Verifica tus datos.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Loading State
  if (authLoading || (user && !error)) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-medium animate-pulse">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left Column - Branding & Info */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-slate-900">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-[10%] right-[10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24 w-full">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
              <Building2 className="w-4 h-4" />
              <span>Plataforma de Gestión Municipal</span>
            </div>
            
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight tracking-tight">
              Transformando la <br />
              <span className="text-blue-500">Gestión Pública</span> <br />
              con Calidad ISO
            </h1>
            
            <p className="text-lg text-slate-400 leading-relaxed max-w-xl">
              Accede al sistema integral para la administración eficiente de servicios, 
              control de procesos y cumplimiento de la norma ISO 18091.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
              <LayoutDashboard className="w-6 h-6 text-blue-400 mb-3" />
              <h3 className="text-white font-semibold mb-1">Panel de Control</h3>
              <p className="text-slate-400 text-xs">Visión global de indicadores</p>
            </div>
            
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
              <ShieldCheck className="w-6 h-6 text-indigo-400 mb-3" />
              <h3 className="text-white font-semibold mb-1">Auditoría Continua</h3>
              <p className="text-slate-400 text-xs">Seguimiento de conformidad</p>
            </div>
          </div>
          
          <div className="mt-12 flex items-center gap-4 text-xs text-slate-500 font-medium">
            <span>© 2026 Sistema de Gestión Municipal</span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <span>Versión 2.0</span>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center items-center p-8 lg:p-12 relative">
        <div className="w-full max-w-sm">
          {/* Mobile Header */}
          <div className="lg:hidden mb-8 text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/20">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Gestión Municipal</h2>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Bienvenido</h2>
            <p className="text-slate-400">Ingresa tus credenciales para continuar.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300 ml-1">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="funcionario@municipio.gob.ar"
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-medium text-slate-300">Contraseña</label>
                <Link href="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 pl-10 pr-12 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/25 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Validando...</span>
                </>
              ) : (
                <>
                  <span>Iniciar Sesión</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            ¿No tienes acceso?{' '}
            <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Solicitar cuenta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
