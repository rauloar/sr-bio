import React, { useState, useEffect } from 'react';
import { DeviceService, LogService } from '../services/api';
import { Device, EventLog } from '../types';

const Events: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [logs, setLogs] = useState<EventLog[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. Cargar Dispositivos
  useEffect(() => {
     const init = async () => {
         const devs = await DeviceService.getAll();
         setDevices(devs);
         if(devs.length > 0) setSelectedDevice(devs[0].id);
     };
     init();
  }, []);

  // 2. Cargar Logs al cambiar selección
  const fetchLogs = async () => {
      if(!selectedDevice) return;
      setLoading(true);
      
      const realLogs = await LogService.getLogsFromDevice(selectedDevice);
      
      // Ordenar por fecha descendente (más recientes primero)
      // Timestamp ahora es ISO string, así que la comparación de fechas funciona correctamente
      realLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setLogs(realLogs);
      setLoading(false);
  };

  const handleSyncAndFetch = async () => {
      setLoading(true);
      if(selectedDevice) {
         await DeviceService.sync(selectedDevice);
         await fetchLogs();
      }
      setLoading(false);
  };

  // Cargar logs iniciales cuando se selecciona un dispositivo
  useEffect(() => {
      fetchLogs();
  }, [selectedDevice]);

  return (
    <div className="flex h-full flex-col p-8 bg-[#101922]">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold leading-tight tracking-[-0.03em] text-white">Registros de Eventos</h1>
            <p className="text-base font-normal leading-normal text-[#92adc9]">Historial de fichajes sincronizados en base de datos.</p>
          </div>
          
          <div className="flex items-center gap-4">
            
            <div className="flex items-center gap-2 bg-[#233648] rounded-lg p-1 pr-2 border border-[#324d67]">
                <div className="flex items-center justify-center pl-2 text-slate-400">
                    <span className="material-symbols-outlined">router</span>
                </div>
                <select 
                        className="h-8 rounded bg-transparent border-none text-sm text-white focus:ring-0 cursor-pointer py-1"
                        value={selectedDevice}
                        onChange={(e) => setSelectedDevice(e.target.value)}
                >
                        {devices.map(d => <option key={d.id} value={d.id} className="bg-[#101922]">{d.name}</option>)}
                </select>
            </div>

            <button 
                onClick={handleSyncAndFetch}
                disabled={loading}
                className="flex h-10 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg bg-primary px-4 text-sm font-bold leading-normal tracking-[0.015em] text-white transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-wait shadow-lg shadow-blue-900/20"
            >
              <span className={`material-symbols-outlined text-xl ${loading ? 'animate-spin' : ''}`}>
                 {loading ? 'sync' : 'cloud_download'}
              </span>
              <span>{loading ? 'Sincronizando...' : 'Sincronizar Logs'}</span>
            </button>

          </div>
        </div>

        {/* Table */}
        <div className="w-full overflow-hidden rounded-xl border border-[#324d67]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#192633] text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold">Marca de Tiempo</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Usuario ID</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Dispositivo</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#233648] bg-[#111a22]">
                {loading && logs.length === 0 ? (
                    <tr><td colSpan={4} className="p-8 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                             <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
                             <span>Cargando datos...</span>
                        </div>
                    </td></tr>
                ) : logs.length === 0 ? (
                    <tr><td colSpan={4} className="p-8 text-center text-slate-500">
                        No hay registros locales. Pulsa "Sincronizar Logs" para descargar del terminal.
                    </td></tr>
                ) : logs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#192633]/50 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4 font-mono text-white">
                          {/* Renderizar fecha formateada localmente */}
                          {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-bold text-white">
                          <span className="bg-slate-700/50 px-2 py-1 rounded text-xs text-slate-300">ID: {log.user}</span>
                      </td>
                      <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-xs text-slate-500">dns</span>
                              {log.device}
                          </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                          {log.details}
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 bg-[#111a22] text-xs text-slate-500 text-center border-t border-[#324d67]">
              Mostrando {logs.length} registros en base de datos.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Events;