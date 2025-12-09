import React, { useState, useEffect } from 'react';
import { DeviceService, UserService } from '../services/api';
import { Device, User } from '../types';

const Users: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDevices, setLoadingDevices] = useState(true);

  // 1. Cargar lista de dispositivos
  useEffect(() => {
     const fetchDevices = async () => {
         setLoadingDevices(true);
         const devs = await DeviceService.getAll();
         setDevices(devs);
         if(devs.length > 0) setSelectedDevice(devs[0].id);
         setLoadingDevices(false);
     };
     fetchDevices();
  }, []);

  // 2. Cargar usuarios cuando cambia el dispositivo seleccionado
  useEffect(() => {
     if(!selectedDevice) return;
     
     const fetchUsers = async () => {
         setLoading(true);
         setUsers([]); // Limpiar lista anterior
         const realUsers = await UserService.getAllFromDevice(selectedDevice);
         setUsers(realUsers);
         setLoading(false);
     };
     fetchUsers();

  }, [selectedDevice]);

  return (
    <div className="flex h-screen flex-col bg-[#101922]">
      <div className="flex-1 overflow-y-auto p-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] text-white">Gestión de Usuarios</h1>
            
            {/* Selector de Dispositivo */}
            <div className="flex items-center gap-3">
                <span className="text-slate-400 text-sm">Dispositivo Fuente:</span>
                <select 
                    className="h-10 rounded-lg border border-[#324d67] bg-[#233648] px-3 text-sm text-white focus:ring-primary"
                    value={selectedDevice}
                    onChange={(e) => setSelectedDevice(e.target.value)}
                    disabled={loadingDevices}
                >
                    {devices.map(d => <option key={d.id} value={d.id}>{d.name} ({d.ip})</option>)}
                </select>
                <button 
                    onClick={() => { const temp = selectedDevice; setSelectedDevice(''); setTimeout(() => setSelectedDevice(temp), 10); }}
                    className="h-10 w-10 flex items-center justify-center rounded-lg bg-[#233648] text-white hover:bg-[#324d67]"
                    title="Recargar"
                >
                    <span className="material-symbols-outlined">refresh</span>
                </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* User List Panel */}
            <div className="flex flex-col gap-4 rounded-xl border border-slate-700 bg-[#111a22] p-6 lg:col-span-1">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-bold text-white">Usuarios en Terminal</h2>
              </div>
              
              <div>
                 <label className="flex h-12 w-full flex-col">
                    <div className="flex h-full w-full flex-1 items-stretch rounded-lg bg-[#233648]">
                       <div className="flex items-center justify-center rounded-l-lg pl-4 text-[#92adc9]">
                          <span className="material-symbols-outlined">search</span>
                       </div>
                       <input 
                          className="flex h-full w-full flex-1 resize-none overflow-hidden rounded-lg border-none bg-transparent px-2 text-sm font-normal leading-normal text-white placeholder-[#92adc9] focus:outline-0 focus:ring-0" 
                          placeholder="Filtrar lista..." 
                       />
                    </div>
                 </label>
              </div>

              <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto -mx-2 pr-2">
                 {loading ? (
                     <div className="p-8 text-center text-slate-400 flex flex-col items-center">
                         <span className="material-symbols-outlined animate-spin mb-2">sync</span>
                         Conectando con terminal...
                     </div>
                 ) : users.length === 0 ? (
                     <div className="p-4 text-center text-slate-500">No se encontraron usuarios o error de conexión.</div>
                 ) : users.map((user) => (
                    <div key={user.id} className={`flex cursor-pointer items-center gap-4 rounded-lg p-3 hover:bg-slate-800/50 bg-[#192633]`}>
                       <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-700 text-slate-300 font-bold">
                           {user.name.charAt(0).toUpperCase()}
                       </div>
                       <div className="flex-1">
                          <p className="font-semibold text-white">{user.name}</p>
                          <p className="text-xs text-slate-400">ID Terminal: {user.id}</p>
                       </div>
                       <span className={`rounded-full px-2 py-1 text-xs font-medium ${user.role === 'Admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-700 text-slate-400'}`}>
                          {user.role || 'User'}
                       </span>
                    </div>
                 ))}
              </div>
            </div>

            {/* Hint Panel */}
            <div className="flex flex-col items-center justify-center rounded-xl border border-slate-700 bg-[#111a22] p-6 lg:col-span-2 text-center text-slate-400">
               <span className="material-symbols-outlined text-4xl mb-4 text-slate-600">touch_app</span>
               <h3 className="text-lg font-bold text-white mb-2">Solo Lectura</h3>
               <p className="max-w-md">
                   Actualmente esta vista muestra los usuarios tal cual están en la memoria del dispositivo físico. 
                   Para editar, usa el menú del propio dispositivo o implementa la escritura en `server.js`.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;