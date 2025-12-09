import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/api';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await AuthService.login(username, password);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-[#101922] p-4 font-display">
      {/* Header Logo */}
      <header className="absolute left-0 right-0 top-0 flex items-center justify-between p-6 md:p-10">
        <div className="flex items-center gap-3 text-white">
          <img
            alt="SR-BIO Logo"
            className="h-8 w-8"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMtoIrKg47e17kY1KwcgZ1O8pV9jkxEzmGdheLwFwgQsANrp_p13ZScYcwDy1Vqi9gs1elAwTUa3PdGVKZfm5eBKeOEZ-gQsntH_wiTjRPo0LZZucJhyrt_zE1W2GflBrfuO7Ur09DWf7zoKOS7b_f72bmzFR125Pam7m_mQIlcUDeL5OqBDEbOvAj9dUDRSylGLmUJ4_u7H55H_7OINxIoupYf8n13JzB2i74luLIQ9Ht6Xa1ZGNTwijSiENxSCeWotU7luD-GEY"
          />
          <h2 className="text-lg font-bold leading-tight">SR-BIO</h2>
        </div>
      </header>

      {/* Main Form */}
      <main className="w-full max-w-md">
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 shadow-lg md:p-10">
          <div className="mb-8 text-center">
            <h1 className="text-[28px] font-bold leading-tight tracking-tight text-white">
              Inicia Sesión
            </h1>
            <p className="mt-2 text-slate-400">Acceso Seguro SR-BIO Manager</p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="flex flex-col">
                <p className="pb-2 text-sm font-medium leading-normal text-slate-300">Usuario</p>
                <div className="relative">
                  <span className="material-symbols-outlined pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    person
                  </span>
                  <input
                    className="flex h-12 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border border-slate-700 bg-slate-800 p-3 pl-10 text-base font-normal leading-normal text-white placeholder:text-slate-500 focus:border-[#137fec] focus:outline-none focus:ring-0"
                    placeholder="Introduce tu usuario"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </label>
            </div>
            <div>
              <label className="flex flex-col">
                <p className="pb-2 text-sm font-medium leading-normal text-slate-300">Contraseña</p>
                <div className="relative">
                  <span className="material-symbols-outlined pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    lock
                  </span>
                  <input
                    className="flex h-12 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border border-slate-700 bg-slate-800 p-3 pl-10 pr-10 text-base font-normal leading-normal text-white placeholder:text-slate-500 focus:border-[#137fec] focus:outline-none focus:ring-0"
                    placeholder="Introduce tu contraseña"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 transition-colors hover:text-[#137fec]"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-x-2.5">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-600 bg-transparent text-[#137fec] focus:ring-[#137fec]/50 focus:ring-offset-slate-900/40"
                />
                <p className="text-sm font-normal text-slate-300">Recuérdame</p>
              </label>
              <a href="#" className="text-sm font-medium text-[#137fec] hover:underline">
                ¿Olvidaste la contraseña?
              </a>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex h-12 w-full min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-[#137fec] px-4 text-base font-bold leading-normal tracking-wide text-white transition-all hover:bg-opacity-90 active:scale-[0.98] ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
            >
              {isLoading ? (
                 <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                    <span>Iniciando sesión...</span>
                 </div>
              ) : (
                 <span className="truncate">Iniciar Sesión</span>
              )}
            </button>
          </form>
        </div>
        <footer className="mt-8 text-center">
          <p className="text-sm text-slate-400">© 2024 SR-BIO. Todos los derechos reservados.</p>
        </footer>
      </main>
    </div>
  );
};

export default Login;