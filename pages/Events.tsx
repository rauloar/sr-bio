import React, { useState, useEffect } from 'react';
import { DeviceService, LogService } from '../services/api';
import { Device, EventLog } from '../types';

const Events: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [logs, setLogs] = useState<EventLog[]>([]);
  const [loading, setLoading] = useState(false);

  // DataTable State
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'timestamp', direction: 'desc' });

  // 1. Cargar Dispositivos
  useEffect(() => {
     const init = async () => {
         const devs = await DeviceService.getAll();
         setDevices(devs);
         if(devs.length > 0) setSelectedDevice(devs[0].id);
     };
     init();
  }, []);

  // 2. Cargar Logs
  const fetchLogs = async () => {
      if(!selectedDevice) return;
      setLoading(true);
      const realLogs = await LogService.getLogsFromDevice(selectedDevice);
      setLogs(realLogs);
      setLoading(false);
  };

  const handleSyncAndFetch = async () => {
      setLoading(true);
      if(selectedDevice) {
         await LogService.downloadLogs(selectedDevice);
         await fetchLogs();
      }
      setLoading(false);
  };

  useEffect(() => {
      fetchLogs();
  }, [selectedDevice]);

  // --- DATATABLE LOGIC ---
  const handleSort = (key: string) => {
      let direction: 'asc' | 'desc' = 'asc';
      if (sortConfig.key === key && sortConfig.direction === 'asc') {
          direction = 'desc';
      }
      setSortConfig({ key, direction });
  };

  // Helper de Formato Fecha
  const formatDate = (isoString: string) => {
      const d = new Date(isoString);
      if(isNaN(d.getTime())) return '-';
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  const formatTime = (isoString: string) => {
      const d = new Date(isoString);
      if(isNaN(d.getTime())) return '-';
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
  };

  const getUserFullName = (log: EventLog) => {
      const name = log.userName || '';
      const last = log.userLastname || '';
      if(!name && !last) return `ID: ${log.user}`;
      return `${name} ${last}`.trim();
  };

  const getAttendanceStatusLabel = (status: number) => {
      switch(status) {
          case 0: // Check-In
              return <span className="inline-flex items-center gap-1.5 rounded-md bg-green-500/10 px-2 py-1 text-xs font-bold text-green-400 border border-green-500/20">
                  <span className="material-symbols-outlined text-[16px]">login</span> Entrada
              </span>;
          case 1: // Check-Out
              return <span className="inline-flex items-center gap-1.5 rounded-md bg-red-500/10 px-2 py-1 text-xs font-bold text-red-400 border border-red-500/20">
                  <span className="material-symbols-outlined text-[16px] rotate-180">logout</span> Salida
              </span>;
          case 2: // Break-Out
              return <span className="inline-flex items-center gap-1.5 rounded-md bg-orange-500/10 px-2 py-1 text-xs font-bold text-orange-400 border border-orange-500/20">
                  <span className="material-symbols-outlined text-[16px]">coffee</span> S. Intermedia
              </span>;
          case 3: // Break-In
              return <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-500/10 px-2 py-1 text-xs font-bold text-blue-400 border border-blue-500/20">
                  <span className="material-symbols-outlined text-[16px]">work_history</span> E. Intermedia
              </span>;
          case 4: // OT-In
              return <span className="inline-flex items-center gap-1.5 rounded-md bg-purple-500/10 px-2 py-1 text-xs font-bold text-purple-400 border border-purple-500/20">
                   <span className="material-symbols-outlined text-[16px]">add_circle</span> E. Extra
              </span>;
          case 5: // OT-Out
              return <span className="inline-flex items-center gap-1.5 rounded-md bg-purple-500/10 px-2 py-1 text-xs font-bold text-purple-400 border border-purple-500/20">
                   <span className="material-symbols-outlined text-[16px]">do_not_disturb_on</span> S. Extra
              </span>;
          default:
              return <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-700 px-2 py-1 text-xs font-medium text-slate-300">
                  Desc ({status})
              </span>;
      }
  };

  const getVerificationMethodIcon = (type: number) => {
      // 1=Finger, 3=Pwd, 4=Card, 15=Face (A veces varía segun SDK, asumimos comunes)
      let icon = 'question_mark';
      let text = 'Otro';
      let color = 'text-slate-400';
      
      if (type === 1) { icon = 'fingerprint'; text = 'Huella'; color = 'text-blue-400'; }
      else if (type === 3 || type === 0) { icon = 'password'; text = 'Clave'; color = 'text-orange-400'; } 
      else if (type === 4 || type === 2) { icon = 'credit_card'; text = 'Tarjeta (RFID)'; color = 'text-purple-400'; }
      else if (type === 15) { icon = 'face'; text = 'Rostro'; color = 'text-green-400'; }

      return (
          <div className="flex items-center gap-2" title={`Método ID: ${type}`}>
              <span className={`material-symbols-outlined text-lg ${color}`}>{icon}</span>
              <span className="text-xs text-slate-300">{text}</span>
          </div>
      );
  };

  // Filtering & Sorting
  const filteredLogs = logs.filter(log => {
      const search = searchTerm.toLowerCase();
      const fullName = getUserFullName(log).toLowerCase();
      const userId = log.user.toString().toLowerCase();
      return fullName.includes(search) || userId.includes(search);
  });

  const sortedLogs = [...filteredLogs].sort((a, b) => {
      if (sortConfig.key === 'timestamp') {
          return sortConfig.direction === 'asc' 
              ? new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime() 
              : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
      if (sortConfig.key === 'user') {
          const nameA = getUserFullName(a).toLowerCase();
          const nameB = getUserFullName(b).toLowerCase();
          if (nameA < nameB) return sortConfig.direction === 'asc' ? -1 : 1;
          if (nameA > nameB) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
      }
      return 0;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLogs = sortedLogs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);


  return (
    <div className="flex h-full flex-col p-8 bg-[#101922]">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold leading-tight tracking-[-0.03em] text-white">Registros de Eventos</h1>
            <p className="text-base font-normal leading-normal text-[#92adc9]">Historial de fichajes sincronizados.</p>
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

        {/* Datatable Wrapper */}
        <div className="flex flex-col rounded-xl border border-[#324d67] bg-[#111a22] shadow-sm">
          
          {/* Table Toolbar */}
          <div className="flex flex-wrap items-center justify-between p-4 gap-4 border-b border-[#324d67]">
               <div className="relative">
                   <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                       <span className="material-symbols-outlined text-sm">search</span>
                   </div>
                   <input 
                       type="text" 
                       className="block w-full p-2 pl-10 text-sm text-white border border-[#324d67] rounded-lg bg-[#192633] focus:ring-primary focus:border-primary placeholder-slate-500" 
                       placeholder="Buscar por nombre..."
                       value={searchTerm}
                       onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                   />
               </div>
               <div className="text-xs text-slate-400">
                   Total: {filteredLogs.length} eventos
               </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#192633] text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-4 font-semibold cursor-pointer hover:text-white select-none"
                    onClick={() => handleSort('user')}
                  >
                      <div className="flex items-center gap-1">
                          Usuario
                          <span className="material-symbols-outlined text-sm opacity-50">
                              {sortConfig.key === 'user' ? (sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                          </span>
                      </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-4 font-semibold cursor-pointer hover:text-white select-none"
                    onClick={() => handleSort('timestamp')}
                  >
                      <div className="flex items-center gap-1">
                          Fecha
                          <span className="material-symbols-outlined text-sm opacity-50">
                             {sortConfig.key === 'timestamp' ? (sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                          </span>
                      </div>
                  </th>
                  <th scope="col" className="px-6 py-4 font-semibold">Hora</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Evento</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Método</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#233648] bg-[#111a22]">
                {loading && logs.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                             <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
                             <span>Cargando datos...</span>
                        </div>
                    </td></tr>
                ) : logs.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-500">
                        No hay datos para mostrar.
                    </td></tr>
                ) : currentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#192633]/50 transition-colors">
                      <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                                  {getUserFullName(log).charAt(0)}
                              </div>
                              <div className="flex flex-col">
                                  <span className="text-white font-medium">{getUserFullName(log)}</span>
                                  <span className="text-[10px] text-slate-500">ID: {log.user}</span>
                              </div>
                          </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-white">
                          {formatDate(log.timestamp)}
                      </td>
                      <td className="px-6 py-4 font-mono text-white">
                          {formatTime(log.timestamp)}
                      </td>
                      <td className="px-6 py-4">
                          {getAttendanceStatusLabel(log.attendanceStatus)}
                      </td>
                      <td className="px-6 py-4">
                          {getVerificationMethodIcon(log.verificationMethod)}
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-[#324d67] bg-[#192633]/50">
               <div className="text-xs text-slate-400">
                   Página {currentPage} de {totalPages || 1}
               </div>
               <div className="flex gap-2">
                   <button 
                       onClick={() => paginate(currentPage - 1)}
                       disabled={currentPage === 1}
                       className="px-3 py-1 rounded bg-[#233648] text-white text-sm hover:bg-[#344a60] disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                       Anterior
                   </button>
                   <button 
                       onClick={() => paginate(currentPage + 1)}
                       disabled={currentPage === totalPages || totalPages === 0}
                       className="px-3 py-1 rounded bg-[#233648] text-white text-sm hover:bg-[#344a60] disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                       Siguiente
                   </button>
               </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Events;