
import React, { useEffect, useState } from 'react';
import { Device, DeviceDiagnostics } from '../types';
import { DeviceService } from '../services/api';

const Devices: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  // Estados para el Modal de Info Real
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStep, setConnectionStep] = useState<string>('');
  const [deviceRealInfo, setDeviceRealInfo] = useState<DeviceDiagnostics | null>(null);

  // Load data
  useEffect(() => {
    const fetchDevices = async () => {
      setLoading(true);
      const data = await DeviceService.getAll();
      setDevices(data);
      if (data.length > 0) setSelectedDevice(data[0]);
      setLoading(false);
    };
    fetchDevices();
  }, []);

  const handleSync = async (device: Device) => {
      if(!window.confirm(`¿Iniciar sincronización con ${device.name}?\n\nEsto conectará al dispositivo, actualizará usuarios y descargará logs nuevos.`)) return;
      DeviceService.sync(device.id);
      alert('Sincronización iniciada en segundo plano.');
  };

  const handleGetRealInfo = async () => {
      if (!selectedDevice) return;
      setIsInfoModalOpen(true);
      setIsConnecting(true);
      setDeviceRealInfo(null);
      setConnectionStep('Iniciando conexión TCP/UDP...');

      // Simulación visual de los pasos de node-zklib en el frontend
      // En una app real, esto podría venir vía socket o simplemente un mensaje de carga general
      const timer1 = setTimeout(() => setConnectionStep('Deshabilitando terminal...'), 800);
      const timer2 = setTimeout(() => setConnectionStep('Leyendo memoria y reloj...'), 1500);

      try {
          const result = await DeviceService.getDeviceInfo(selectedDevice.id);
          clearTimeout(timer1);
          clearTimeout(timer2);
          setConnectionStep('Habilitando terminal y desconectando...');
          
          setTimeout(() => {
             setDeviceRealInfo(result);
             setIsConnecting(false);
          }, 500);
          
      } catch (e) {
          setDeviceRealInfo({
              success: false,
              message: "Error de comunicación con el servidor API."
          });
          setIsConnecting(false);
      }
  };

  // Helper para calcular porcentaje
  const calcPercent = (used: number, total: number) => {
    if(!total) return 0;
    return Math.min(100, Math.round((used / total) * 100));
  };

  return (
    <div className="flex h-screen flex-col bg-[#101922]">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/10 bg-[#111a22] px-8">
        <h1 className="text-lg font-bold text-white">Gestión de Dispositivos</h1>
        <div className="flex flex-1 items-center justify-end gap-6">
          <button className="flex h-10 min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg bg-primary px-4 text-sm font-bold text-white transition-colors hover:bg-primary/90">
            <span className="material-symbols-outlined">add</span>
            <span className="truncate">Añadir Dispositivo</span>
          </button>
          <div className="size-10 rounded-full bg-cover bg-center bg-no-repeat aspect-square" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBi2BiXGn43U3J2AFbqw90t5qoo1lHUOCNW3o7T7kCZTc7gPkt4-1DA_y2D4_hOdl_PojC89G2FD-2AYcArIp0-T0T_kJlgFQejqC5T1IuC5HYV9xVfGPe5KK3n_0liSq6dWcF-jMQyi4_pIfHqFPmq0N-1XXm58Ac6SQFQjJTqi_RCsFkSezSfJFW81wMsfwQuJlOv6FGacn4-soEoLtv_C-0VwAem5MRC9ENAFWeLkCLvz6hlmtsYcmiv5Wjjg1SyWaBQxmny9h0")' }}></div>
        </div>
      </header>

      {/* Main Content Split View */}
      <div className="flex flex-1 overflow-hidden">
        {/* Device List Table */}
        <div className="flex flex-1 flex-col overflow-y-auto p-6">
          <div className="flex flex-col gap-4 rounded-lg border border-slate-200/10 bg-[#111a22] p-4">
            <div className="flex items-center gap-4">
              <label className="flex flex-1">
                <div className="flex w-full items-stretch rounded-lg">
                  <div className="flex items-center justify-center rounded-l-lg border-r-0 border-none bg-[#233648] pl-4 text-slate-400">
                    <span className="material-symbols-outlined">search</span>
                  </div>
                  <input className="flex h-12 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg border-none bg-[#233648] px-4 text-base font-normal text-white placeholder:text-slate-400 focus:outline-0 focus:ring-0" placeholder="Buscar por nombre de dispositivo o dirección IP" />
                </div>
              </label>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase text-slate-400">
                  <tr>
                    <th className="p-4" scope="col"><input type="checkbox" className="rounded border-slate-500 bg-[#233648] text-primary focus:ring-primary" /></th>
                    <th className="px-6 py-3" scope="col">Estado (BD)</th>
                    <th className="px-6 py-3" scope="col">Nombre</th>
                    <th className="px-6 py-3" scope="col">IP</th>
                    <th className="px-6 py-3" scope="col">Modelo</th>
                    <th className="px-6 py-3" scope="col">Ultima Conexión</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="p-8 text-center text-slate-400">Cargando dispositivos...</td></tr>
                  ) : devices.map((dev) => (
                    <tr 
                        key={dev.id} 
                        onClick={() => setSelectedDevice(dev)}
                        className={`border-b border-slate-200/10 cursor-pointer transition-colors ${selectedDevice?.id === dev.id ? 'bg-primary/10' : 'hover:bg-slate-500/10'}`}
                    >
                        <td className="p-4"><input type="checkbox" checked={selectedDevice?.id === dev.id} readOnly className="rounded border-slate-500 bg-[#233648] text-primary focus:ring-primary" /></td>
                        <td className="px-6 py-4">
                            {/* El estado aquí es estático de la BD, no real-time ping */}
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-700 px-2 py-1 text-xs font-medium text-slate-300">
                                <span className="size-1.5 rounded-full bg-slate-400"></span>
                                Standby
                            </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-white">{dev.name}</td>
                        <td className="px-6 py-4 font-mono text-slate-400">{dev.ip}</td>
                        <td className="px-6 py-4">{dev.model}</td>
                        <td className="px-6 py-4">{dev.lastSeen}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        {selectedDevice && (
            <aside className="flex w-96 shrink-0 flex-col gap-6 border-l border-slate-200/10 bg-[#111a22] p-6 overflow-y-auto">
            <div className="flex flex-col items-center gap-4 rounded-lg bg-[#233648] p-6">
                <div className="relative">
                    <img 
                        className="h-32 w-32 object-contain filter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                        src={selectedDevice.image} 
                        alt="Terminal Biométrico" 
                    />
                </div>
                
                <div className="text-center">
                   <h3 className="text-xl font-bold text-white">{selectedDevice.name}</h3>
                   <p className="text-sm text-slate-400">{selectedDevice.ip}</p>
                </div>
                
                <div className="text-center px-4 py-2 bg-black/20 rounded text-xs text-slate-400">
                    Conexión bajo demanda (UDP/TCP)
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Acciones de Terminal</h4>
                <div className="grid grid-cols-1 gap-3">
                    <button onClick={handleGetRealInfo} className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-900/20 transition-all">
                        <span className="material-symbols-outlined text-xl">info</span> 
                        Conectar y Obtener Info
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => {}} className="flex items-center justify-center gap-2 rounded-lg bg-[#233648] py-3 text-sm font-medium text-white hover:bg-[#344a60]">
                            <span className="material-symbols-outlined text-lg">power_settings_new</span> Reiniciar
                        </button>
                        <button onClick={() => handleSync(selectedDevice)} className="flex items-center justify-center gap-2 rounded-lg bg-[#233648] py-3 text-sm font-medium text-white hover:bg-[#344a60]">
                            <span className="material-symbols-outlined text-lg">sync</span> Sincronizar
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Configuración Estática</h4>
                <div className="flex flex-col rounded-lg bg-[#192633] p-4">
                  <div className="space-y-3 text-sm">
                      <div className="flex justify-between border-b border-slate-700 pb-2">
                        <span className="text-slate-400">Puerto de Comando</span>
                        <span className="font-mono text-white">{selectedDevice.port || 4370}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-700 pb-2">
                        <span className="text-slate-400">MAC Address</span>
                        <span className="font-mono text-white">{selectedDevice.mac}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Firmware (Cache)</span>
                        <span className="font-medium text-white">{selectedDevice.firmware}</span>
                      </div>
                  </div>
                </div>
            </div>
            </aside>
        )}
      </div>

      {/* Modal de Info Real */}
      {isInfoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-[#111a22] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="flex items-center justify-between border-b border-slate-700 bg-[#192633] px-6 py-4 shrink-0">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          <span className="material-symbols-outlined">terminal</span>
                          Información del Dispositivo
                      </h3>
                      <button 
                        onClick={() => setIsInfoModalOpen(false)}
                        disabled={isConnecting}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-700 hover:text-white disabled:opacity-50"
                      >
                          <span className="material-symbols-outlined">close</span>
                      </button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto">
                      {isConnecting ? (
                          <div className="flex flex-col items-center gap-6 py-8">
                             <div className="relative">
                                <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-700 border-t-primary"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-slate-500">settings_ethernet</span>
                                </div>
                             </div>
                             <div className="flex flex-col items-center gap-2 text-center">
                                <p className="text-lg font-bold text-white">Conectando con Terminal...</p>
                                <p className="text-sm text-primary animate-pulse">{connectionStep}</p>
                                <p className="text-xs text-slate-500 max-w-xs mt-2">
                                    El sistema está conectando, deshabilitando el dispositivo para lectura segura y volviendo a habilitar.
                                </p>
                             </div>
                          </div>
                      ) : deviceRealInfo ? (
                          deviceRealInfo.success && deviceRealInfo.data ? (
                              <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-300">
                                  
                                  {/* Cabecera Estado */}
                                  <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4 flex items-center gap-3">
                                      <span className="material-symbols-outlined text-green-500 text-3xl">check_circle</span>
                                      <div>
                                          <h4 className="font-bold text-white">Conexión Exitosa</h4>
                                          <p className="text-xs text-green-200">Datos obtenidos directamente del hardware ZKTeco.</p>
                                      </div>
                                  </div>

                                  {/* Hora del Dispositivo */}
                                  <div className="grid grid-cols-2 gap-4">
                                      <div className="rounded-lg bg-[#192633] p-4 border border-slate-700">
                                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Hora del Dispositivo</span>
                                          <div className="mt-1 text-lg font-mono font-bold text-white">{deviceRealInfo.data.deviceTime.split(' ')[1]}</div>
                                          <div className="text-xs text-slate-500">{deviceRealInfo.data.deviceTime.split(' ')[0]}</div>
                                      </div>
                                      <div className="rounded-lg bg-[#192633] p-4 border border-slate-700">
                                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Firmware</span>
                                          <div className="mt-1 text-sm font-bold text-white truncate" title={deviceRealInfo.data.firmwareVersion}>{deviceRealInfo.data.firmwareVersion}</div>
                                          <div className="text-xs text-slate-500">{deviceRealInfo.data.platform}</div>
                                      </div>
                                  </div>

                                  {/* Barras de Capacidad */}
                                  <div className="space-y-4">
                                      <h4 className="text-sm font-bold text-white border-b border-slate-700 pb-2">Uso de Memoria</h4>
                                      
                                      {/* Usuarios */}
                                      <div>
                                          <div className="flex justify-between text-xs mb-1">
                                              <span className="text-slate-300">Usuarios</span>
                                              <span className="text-slate-400">{deviceRealInfo.data.capacity.userCount} / {deviceRealInfo.data.capacity.userCapacity}</span>
                                          </div>
                                          <div className="h-2 w-full rounded-full bg-slate-700 overflow-hidden">
                                              <div 
                                                className="h-full bg-blue-500 transition-all duration-500" 
                                                style={{ width: `${calcPercent(deviceRealInfo.data.capacity.userCount, deviceRealInfo.data.capacity.userCapacity)}%` }}
                                              ></div>
                                          </div>
                                      </div>

                                      {/* Huellas */}
                                      <div>
                                          <div className="flex justify-between text-xs mb-1">
                                              <span className="text-slate-300">Huellas</span>
                                              <span className="text-slate-400">{deviceRealInfo.data.capacity.fingerprintCount} / {deviceRealInfo.data.capacity.fingerprintCapacity}</span>
                                          </div>
                                          <div className="h-2 w-full rounded-full bg-slate-700 overflow-hidden">
                                              <div 
                                                className="h-full bg-purple-500 transition-all duration-500" 
                                                style={{ width: `${calcPercent(deviceRealInfo.data.capacity.fingerprintCount, deviceRealInfo.data.capacity.fingerprintCapacity)}%` }}
                                              ></div>
                                          </div>
                                      </div>

                                      {/* Logs */}
                                      <div>
                                          <div className="flex justify-between text-xs mb-1">
                                              <span className="text-slate-300">Registros (Logs)</span>
                                              <span className="text-slate-400">{deviceRealInfo.data.capacity.logCount} / {deviceRealInfo.data.capacity.logCapacity}</span>
                                          </div>
                                          <div className="h-2 w-full rounded-full bg-slate-700 overflow-hidden">
                                              <div 
                                                className={`h-full transition-all duration-500 ${calcPercent(deviceRealInfo.data.capacity.logCount, deviceRealInfo.data.capacity.logCapacity) > 90 ? 'bg-red-500' : 'bg-green-500'}`} 
                                                style={{ width: `${calcPercent(deviceRealInfo.data.capacity.logCount, deviceRealInfo.data.capacity.logCapacity)}%` }}
                                              ></div>
                                          </div>
                                      </div>
                                  </div>

                              </div>
                          ) : (
                              <div className="flex flex-col items-center animate-in zoom-in duration-300 py-6">
                                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 text-red-500">
                                      <span className="material-symbols-outlined text-4xl">wifi_off</span>
                                  </div>
                                  <h4 className="text-xl font-bold text-white mb-2">Error de Conexión</h4>
                                  <p className="text-slate-400 text-center text-sm px-4">{deviceRealInfo.message}</p>
                                  <button onClick={handleGetRealInfo} className="mt-6 text-primary hover:underline text-sm font-bold">Reintentar</button>
                              </div>
                          )
                      ) : null}
                  </div>

                  <div className="border-t border-slate-700 bg-[#192633] px-6 py-4 flex justify-end shrink-0">
                      <button 
                        onClick={() => setIsInfoModalOpen(false)} 
                        disabled={isConnecting}
                        className="rounded-lg bg-[#233648] px-4 py-2 text-sm font-bold text-white hover:bg-[#344a60] disabled:opacity-50"
                      >
                          Cerrar
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default Devices;
