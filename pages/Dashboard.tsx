import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogService, AuthService, DeviceService, SettingsService } from '../services/api';
import { Device } from '../types';

const Dashboard: React.FC = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initData = async () => {
        setLoadingDevices(true);
        const devs = await DeviceService.getAll();
        setDevices(devs);
        setLoadingDevices(false);
    };
    initData();
  }, []);

  const handleDownloadLogs = async () => {
    setIsDownloading(true);
    // Leer configuración para saber si borrar
    const settings = await SettingsService.get();
    const shouldClear = settings.data?.clearLogsAfterDownload || false;
    
    if(shouldClear) {
        if(!confirm("ADVERTENCIA: La configuración indica que se BORRARÁN los logs del terminal después de descargarlos. ¿Continuar?")) {
            setIsDownloading(false);
            return;
        }
    }

    const result = await LogService.downloadFromTerminals(shouldClear);
    setIsDownloading(false);

    if (result.success) {
      alert(result.message);
    } else {
      alert("Error: " + result.message);
    }
  };

  const handleLogout = () => {
      AuthService.logout();
      navigate('/');
  };

  // Cálculos reales
  const onlineCount = devices.filter(d => d.status === 'Online').length; // Nota: el backend por defecto devuelve offline hasta ping
  const offlineCount = devices.length - onlineCount;

  return (
    <div className="flex flex-col h-full bg-[#101922]">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#233648] px-4 py-3 sm:px-10 sm:py-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="hidden flex-1 sm:block max-w-sm">
            <label className="flex flex-col h-10 w-full">
              <div className="flex h-full w-full items-stretch rounded-lg bg-[#233648]">
                <div className="flex items-center justify-center pl-4 text-[#92adc9]">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <input
                  className="flex h-full w-full flex-1 rounded-lg border-none bg-transparent px-4 text-white placeholder-[#92adc9] focus:ring-0"
                  placeholder="Buscar..."
                />
              </div>
            </label>
          </div>
        </div>
        <div className="flex items-center justify-end gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-cover bg-center" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBLjtYIikC7MMbCWG8EF8CThnVY3LSlRAopy2feM9cBUVKMOrNnErL9ss8Bse1YlCu39apnryXCKMtSNSl-tm3zShpmHDbFCKuSAtGdoPk_5mSUkANRzSTggbJ9I3kg-dYE57AiKbD6hFdBpI2uJWlfYhh8mX1tfpCEMQY7hM6k0TXoeMBsZ_A0nzea6WfvuHaDWKUIfqhlQ3HbnF8HO_Ed-h_kQloLX6lTD6K9_wVX2YYfK8h6TbX0U0zskp3eQ3RPCC_cI6jzo54")' }}></div>
            <button onClick={handleLogout} className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30">
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-10">
        <div className="flex flex-col gap-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-black leading-tight tracking-[-0.033em] text-white sm:text-4xl">Inicio</h1>
              <p className="text-[#92adc9] text-sm sm:text-base">Vista general en tiempo real.</p>
            </div>
            <div className="flex items-center gap-4">
               <button 
                  onClick={handleDownloadLogs}
                  disabled={isDownloading}
                  className={`flex items-center justify-center gap-2 rounded-lg h-10 px-4 text-sm font-bold text-white transition-all ${isDownloading ? 'bg-slate-600 cursor-wait' : 'bg-[#137fec] hover:bg-[#137fec]/90'}`}
               >
                  <span className={`material-symbols-outlined text-base ${isDownloading ? 'animate-spin' : ''}`}>
                    {isDownloading ? 'sync' : 'cloud_download'}
                  </span>
                  <span>{isDownloading ? 'Conectando...' : 'Descargar Fichajes'}</span>
               </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
             {[
               { label: 'Total Dispositivos', value: devices.length.toString(), color: 'text-white', link: '/dashboard/devices' },
               { label: 'En Línea (Est.)', value: onlineCount.toString(), color: 'text-green-500', link: '/dashboard/devices' },
               { label: 'Desconectados', value: offlineCount.toString(), color: 'text-red-500', link: '/dashboard/devices' },
               { label: 'Registros', value: '-', color: 'text-white', link: '/dashboard/events' },
             ].map((stat, idx) => (
               <Link key={idx} to={stat.link} className="flex flex-col gap-2 rounded-xl border border-[#324d67] bg-[#111a22] p-6 hover:bg-[#192633] transition-colors">
                 <p className="text-base font-medium text-[#92adc9]">{stat.label}</p>
                 <p className={`text-3xl font-bold leading-tight ${stat.color}`}>{stat.value}</p>
               </Link>
             ))}
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
             <div className="flex flex-col gap-4 rounded-xl border border-[#324d67] bg-[#111a22] p-6 xl:col-span-3">
                <div className="flex items-center justify-between">
                   <h2 className="text-xl font-bold text-white">Estado del Dispositivo</h2>
                   <Link to="/dashboard/devices" className="text-sm font-bold text-primary hover:underline">Gestionar</Link>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead>
                         <tr className="border-b border-[#324d67]">
                            <th className="p-3 text-sm font-semibold text-[#92adc9]">Dispositivo</th>
                            <th className="hidden p-3 text-sm font-semibold text-[#92adc9] md:table-cell">Dirección IP</th>
                            <th className="p-3 text-sm font-semibold text-[#92adc9]">Estado Configurado</th>
                            <th className="hidden p-3 text-sm font-semibold text-[#92adc9] sm:table-cell">Puerto</th>
                         </tr>
                      </thead>
                      <tbody>
                         {loadingDevices ? (
                             <tr><td colSpan={4} className="p-4 text-center text-slate-500">Buscando dispositivos...</td></tr>
                         ) : devices.map((dev, i) => (
                            <tr key={i} className="border-b border-[#233648] last:border-0 hover:bg-white/5">
                               <td className="p-3 text-sm text-white font-medium">{dev.name}</td>
                               <td className="hidden p-3 text-sm text-[#92adc9] md:table-cell font-mono">{dev.ip}</td>
                               <td className="p-3">
                                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium bg-slate-700 text-slate-300`}>
                                     {dev.status}
                                  </span>
                               </td>
                               <td className="hidden p-3 text-sm text-[#92adc9] sm:table-cell">{dev.port}</td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;