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
      setLogs([]); 
      const realLogs = await LogService.getLogsFromDevice(selectedDevice);
      // Ordenar por fecha descendente
      realLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setLogs(realLogs);
      setLoading(false);
  };

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
            <p className="text-base font-normal leading-normal text-[#92adc9]">Datos descargados directamente de la memoria del terminal.</p>
          </div>
          <div className="flex items-center gap-2">
            
            <select 
                    className="h-10 rounded-lg border border-[#324d67] bg-[#233648] px-3 text-sm text-white focus:ring-primary"
                    value={selectedDevice}
                    onChange={(e) => setSelectedDevice(e.target.value)}
            >
                    {devices.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>

            <button 
                onClick={fetchLogs}
                disabled={loading}
                className="flex h-10 min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg border border-[#324d67] bg-[#233648] px-4 text-sm font-bold leading-normal tracking-[0.015em] text-white transition-colors hover:bg-[#2a3f55]"
            >
              <span className={`material-symbols-outlined text-base ${loading ? 'animate-spin' : ''}`}>refresh</span>
              <span className="truncate">{loading ? 'Cargando...' : 'Actualizar'}</span>
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
                {loading ? (
                    <tr><td colSpan={5} className="p-8 text-center">Conectando con dispositivo y descargando logs...</td></tr>
                ) : logs.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-500">No hay registros o no se pudo conectar.</td></tr>
                ) : logs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#192633]/50">
                      <td className="whitespace-nowrap px-6 py-4 font-mono text-white">{log.timestamp}</td>
                      <td className="px-6 py-4 font-bold text-white">{log.user}</td>
                      <td className="px-6 py-4">{log.device}</td>
                      <td className="px-6 py-4 text-slate-400">{log.details}</td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 bg-[#111a22] text-xs text-slate-500 text-center border-t border-[#324d67]">
              Mostrando {logs.length} registros recuperados.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Events;