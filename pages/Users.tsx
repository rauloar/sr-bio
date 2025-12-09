import React, { useState, useEffect } from 'react';
import { DeviceService, UserService } from '../services/api';
import { Device, User } from '../types';

const Users: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDevices, setLoadingDevices] = useState(true);

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', role: 'User' });
  const [saving, setSaving] = useState(false);

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

  // 2. Cargar usuarios
  const fetchUsers = async () => {
     if(!selectedDevice) return;
     setLoading(true);
     setUsers([]);
     const realUsers = await UserService.getAllFromDevice(selectedDevice);
     setUsers(realUsers);
     setLoading(false);
  };

  useEffect(() => {
      fetchUsers();
  }, [selectedDevice]);

  const handleSync = async () => {
      if(!selectedDevice) return;
      if(!window.confirm("Esto descargará todos los usuarios del terminal a la base de datos local. ¿Continuar?")) return;
      
      setLoading(true);
      await DeviceService.sync(selectedDevice);
      await fetchUsers();
      setLoading(false);
  };

  const openEditModal = (user: User) => {
      setEditingUser(user);
      setEditForm({ name: user.name, role: user.role || 'User' });
      setIsModalOpen(true);
  };

  const handleSaveUser = async () => {
      if(!editingUser || !editingUser.internalUid) return;
      
      setSaving(true);
      const success = await UserService.update(editingUser.internalUid, editForm);
      setSaving(false);
      
      if(success) {
          setIsModalOpen(false);
          fetchUsers(); // Recargar lista
      } else {
          alert("Error al guardar cambios");
      }
  };

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
                    {devices.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <button 
                    onClick={handleSync}
                    className="flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-white hover:bg-primary/90 font-bold text-sm"
                    title="Sincronizar con Terminal"
                    disabled={loading}
                >
                    <span className={`material-symbols-outlined ${loading ? 'animate-spin' : ''}`}>sync</span>
                    {loading ? 'Sincronizando...' : 'Sincronizar'}
                </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* User List Panel */}
            <div className="flex flex-col gap-4 rounded-xl border border-slate-700 bg-[#111a22] p-6 lg:col-span-1">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-bold text-white">Usuarios (Base de Datos Local)</h2>
                <span className="text-xs text-slate-500">{users.length} usuarios</span>
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
                         Cargando...
                     </div>
                 ) : users.length === 0 ? (
                     <div className="p-4 text-center text-slate-500">No hay usuarios. Pulsa Sincronizar.</div>
                 ) : users.map((user) => (
                    <div key={user.id} className={`flex items-center gap-4 rounded-lg p-3 hover:bg-slate-800/50 bg-[#192633] group`}>
                       <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-700 text-slate-300 font-bold shrink-0">
                           {user.name.charAt(0).toUpperCase()}
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white truncate">{user.name}</p>
                          <p className="text-xs text-slate-400">ID: {user.id}</p>
                       </div>
                       <span className={`rounded-full px-2 py-1 text-xs font-medium ${user.role === 'Admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-700 text-slate-400'}`}>
                          {user.role || 'User'}
                       </span>
                       <button 
                            onClick={() => openEditModal(user)}
                            className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-white transition-opacity"
                       >
                           <span className="material-symbols-outlined">edit</span>
                       </button>
                    </div>
                 ))}
              </div>
            </div>

            {/* Hint Panel */}
            <div className="flex flex-col items-center justify-center rounded-xl border border-slate-700 bg-[#111a22] p-6 lg:col-span-2 text-center text-slate-400">
               <span className="material-symbols-outlined text-4xl mb-4 text-slate-600">settings_sync</span>
               <h3 className="text-lg font-bold text-white mb-2">Gestión Local</h3>
               <p className="max-w-md">
                   Los cambios realizados aquí se guardan en la base de datos del servidor local. 
                   El ID del usuario en el terminal se mantiene como referencia.
               </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="w-full max-w-md rounded-xl border border-slate-700 bg-[#111a22] shadow-2xl overflow-hidden">
                  <div className="border-b border-slate-700 bg-[#192633] px-6 py-4">
                      <h3 className="text-lg font-bold text-white">Editar Usuario</h3>
                  </div>
                  <div className="p-6 flex flex-col gap-4">
                      <div>
                          <label className="block text-sm font-medium text-slate-400 mb-1">ID Terminal</label>
                          <input disabled value={editingUser?.id} className="w-full rounded-lg bg-slate-800 border-slate-600 text-slate-400 cursor-not-allowed" />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">Nombre Completo</label>
                          <input 
                            value={editForm.name}
                            onChange={e => setEditForm({...editForm, name: e.target.value})}
                            className="w-full rounded-lg bg-[#233648] border-slate-600 text-white focus:ring-primary focus:border-primary" 
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">Rol</label>
                          <select 
                             value={editForm.role}
                             onChange={e => setEditForm({...editForm, role: e.target.value})}
                             className="w-full rounded-lg bg-[#233648] border-slate-600 text-white focus:ring-primary focus:border-primary"
                          >
                              <option value="User">Usuario Normal</option>
                              <option value="Admin">Administrador</option>
                          </select>
                      </div>
                  </div>
                  <div className="border-t border-slate-700 bg-[#192633] px-6 py-4 flex justify-end gap-3">
                      <button 
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 font-medium text-sm"
                      >
                          Cancelar
                      </button>
                      <button 
                        onClick={handleSaveUser}
                        disabled={saving}
                        className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 font-bold text-sm flex items-center gap-2"
                      >
                          {saving && <span className="material-symbols-outlined text-sm animate-spin">sync</span>}
                          Guardar Cambios
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default Users;