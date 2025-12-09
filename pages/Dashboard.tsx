import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogService, AuthService } from '../services/api';

const Dashboard: React.FC = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSecure, setIsSecure] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if protocol is https
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        setIsSecure(false);
    }
  }, []);

  const handleDownloadLogs = async () => {
    setIsDownloading(true);
    // Llamada al servicio simulado
    const result = await LogService.downloadFromTerminals();
    setIsDownloading(false);

    if (result.success) {
      alert(result.message); // En una app real, usaríamos un Toast/Notification mejor
    } else {
      alert("Error: " + result.message);
    }
  };

  const handleLogout = () => {
      AuthService.logout();
      navigate('/');
  };

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
          <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#233648] text-white hover:bg-[#324d67]">
            <span className="material-symbols-outlined">notifications</span>
          </button>
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
        
        {/* Security Warning Banner */}
        {!isSecure && (
            <div className="mb-8 flex items-center gap-3 rounded-xl border border-yellow-600/50 bg-yellow-500/10 p-4 text-yellow-200">
                <span className="material-symbols-outlined text-3xl">warning</span>
                <div className="flex flex-col">
                    <span className="font-bold text-lg">Conexión No Segura Detectada</span>
                    <p className="text-sm text-yellow-200/80">Estás accediendo vía DynDNS sin HTTPS. Tus credenciales podrían ser interceptadas. Configura un certificado SSL (Let's Encrypt) inmediatamente.</p>
                </div>
            </div>
        )}

        <div className="flex flex-col gap-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-black leading-tight tracking-[-0.033em] text-white sm:text-4xl">Inicio</h1>
              <p className="text-[#92adc9] text-sm sm:text-base">Un resumen de sus dispositivos y actividad.</p>
            </div>
            <div className="flex items-center gap-4">
               {/* New Download Button */}
               <button 
                  onClick={handleDownloadLogs}
                  disabled={isDownloading}
                  className={`flex items-center justify-center gap-2 rounded-lg h-10 px-4 text-sm font-bold text-white transition-all ${isDownloading ? 'bg-slate-600 cursor-wait' : 'bg-[#137fec] hover:bg-[#137fec]/90'}`}
               >
                  <span className={`material-symbols-outlined text-base ${isDownloading ? 'animate-spin' : ''}`}>
                    {isDownloading ? 'sync' : 'cloud_download'}
                  </span>
                  <span>{isDownloading ? 'Descargando...' : 'Descargar Fichajes'}</span>
               </button>

               <button className="flex items-center justify-center gap-2 rounded-lg bg-[#233648] h-10 px-4 text-sm font-bold text-white hover:bg-[#324d67]">
                  <span className="material-symbols-outlined text-base">refresh</span>
                  <span className="hidden sm:inline">Actualizar</span>
               </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
             {[
               { label: 'Total Dispositivos', value: '24', color: 'text-white', link: '/dashboard/devices' },
               { label: 'En Línea', value: '21', color: 'text-green-500', link: '/dashboard/devices' },
               { label: 'Desconectados', value: '3', color: 'text-red-500', link: '/dashboard/devices' },
               { label: 'Asistencia Hoy', value: '1,204', color: 'text-white', link: '/dashboard/events' },
             ].map((stat, idx) => (
               <Link key={idx} to={stat.link} className="flex flex-col gap-2 rounded-xl border border-[#324d67] bg-[#111a22] p-6 hover:bg-[#192633] transition-colors">
                 <p className="text-base font-medium text-[#92adc9]">{stat.label}</p>
                 <p className={`text-3xl font-bold leading-tight ${stat.color}`}>{stat.value}</p>
               </Link>
             ))}
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
             <div className="flex flex-col gap-4 rounded-xl border border-[#324d67] bg-[#111a22] p-6 xl:col-span-2">
                <div className="flex items-center justify-between">
                   <h2 className="text-xl font-bold text-white">Estado del Dispositivo</h2>
                   <Link to="/dashboard/devices" className="text-sm font-bold text-primary hover:underline">Ver Todos</Link>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead>
                         <tr className="border-b border-[#324d67]">
                            <th className="p-3 text-sm font-semibold text-[#92adc9]">Dispositivo</th>
                            <th className="hidden p-3 text-sm font-semibold text-[#92adc9] md:table-cell">Dirección IP</th>
                            <th className="p-3 text-sm font-semibold text-[#92adc9]">Estado</th>
                            <th className="hidden p-3 text-sm font-semibold text-[#92adc9] sm:table-cell">Última vez visto</th>
                         </tr>
                      </thead>
                      <tbody>
                         {[
                            { name: 'Entrada Principal', ip: '192.168.1.10', status: 'online', time: 'Justo ahora' },
                            { name: 'Oficina Trasera', ip: '192.168.1.12', status: 'online', time: 'Justo ahora' },
                            { name: 'Puerta Almacén', ip: '192.168.1.15', status: 'offline', time: 'Hace 2 horas' },
                            { name: 'Sala Servidores', ip: '192.168.1.21', status: 'online', time: 'Justo ahora' },
                         ].map((dev, i) => (
                            <tr key={i} className="border-b border-[#233648] last:border-0 hover:bg-white/5 cursor-pointer">
                               <td className="p-3 text-sm text-white">{dev.name}</td>
                               <td className="hidden p-3 text-sm text-[#92adc9] md:table-cell">{dev.ip}</td>
                               <td className="p-3">
                                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${dev.status === 'online' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                     <span className={`size-1.5 rounded-full ${dev.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                     {dev.status === 'online' ? 'En línea' : 'Desconectado'}
                                  </span>
                               </td>
                               <td className="hidden p-3 text-sm text-[#92adc9] sm:table-cell">{dev.time}</td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>

             <div className="flex flex-col gap-4 rounded-xl border border-[#324d67] bg-[#111a22] p-6">
                <div className="flex items-center justify-between">
                   <h2 className="text-xl font-bold text-white">Actividad Reciente</h2>
                   <Link to="/dashboard/events" className="text-sm font-bold text-primary hover:underline">Ver Todos</Link>
                </div>
                <div className="flex flex-col gap-4">
                   {[
                      { icon: 'login', color: 'text-primary bg-primary/20', text: 'John Doe se registró en la Entrada Principal.', time: 'Hace 2 minutos' },
                      { icon: 'link_off', color: 'text-red-500 bg-red-500/20', text: "Dispositivo 'Puerta Almacén' desconectado.", time: 'Hace 15 minutos' },
                      { icon: 'login', color: 'text-primary bg-primary/20', text: 'Jane Smith se registró en la Oficina Trasera.', time: 'Hace 28 minutos' },
                      { icon: 'warning', color: 'text-yellow-500 bg-yellow-500/20', text: "Actualización de firmware disponible para 'Sala de Servidores'.", time: 'Hace 1 hora' },
                   ].map((act, i) => (
                      <div key={i} className="flex items-start gap-3">
                         <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${act.color}`}>
                            <span className="material-symbols-outlined text-base">{act.icon}</span>
                         </div>
                         <div className="flex flex-col">
                            <p className="text-sm text-white">{act.text}</p>
                            <p className="text-xs text-[#92adc9]">{act.time}</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;