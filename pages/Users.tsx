import React, { useState, useEffect } from 'react';
import { DeviceService, UserService } from '../services/api';
import { Device, User } from '../types';

const Users: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDevices, setLoadingDevices] = useState(true);

  // Edit State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});
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
     setSelectedUser(null); // Clear selection on reload
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

  const handleSelectUser = (user: User) => {
      setSelectedUser(user);
      setEditForm({ 
          name: user.name, 
          lastname: user.lastname || '',
          role: user.role || 'User',
          address: user.address || '',
          city: user.city || '',
          province: user.province || '',
          cuit: user.cuit || '',
          phone: user.phone || '',
          email: user.email || ''
      });
  };

  const handleSaveUser = async () => {
      if(!selectedUser || !selectedUser.internalUid) return;
      
      setSaving(true);
      const success = await UserService.update(selectedUser.internalUid, editForm);
      setSaving(false);
      
      if(success) {
          alert("Datos guardados correctamente");
          fetchUsers(); 
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
                <h2 className="text-lg font-bold text-white">Usuarios</h2>
                <span className="text-xs text-slate-500">{users.length} encontrados</span>
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
                    <div 
                        key={user.id} 
                        onClick={() => handleSelectUser(user)}
                        className={`flex items-center gap-4 rounded-lg p-3 cursor-pointer transition-colors ${selectedUser?.id === user.id ? 'bg-primary/20 border border-primary/50' : 'bg-[#192633] hover:bg-slate-800'}`}
                    >
                       <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-700 text-slate-300 font-bold shrink-0">
                           {user.name.charAt(0).toUpperCase()}
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className={`font-semibold truncate ${selectedUser?.id === user.id ? 'text-primary' : 'text-white'}`}>{user.name} {user.lastname}</p>
                          <p className="text-xs text-slate-400">ID: {user.id} {user.cuit && `| CUIT: ${user.cuit}`}</p>
                       </div>
                       <span className={`rounded-full px-2 py-1 text-xs font-medium ${user.role === 'Admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-700 text-slate-400'}`}>
                          {user.role || 'User'}
                       </span>
                    </div>
                 ))}
              </div>
            </div>

            {/* Extended Data Form Panel */}
            <div className="flex flex-col gap-6 rounded-xl border border-slate-700 bg-[#111a22] p-6 lg:col-span-2">
               {selectedUser ? (
                   <>
                       <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                           <div className="flex items-center gap-4">
                               <div className="h-14 w-14 flex items-center justify-center rounded-full bg-primary text-white text-2xl font-bold">
                                   {selectedUser.name.charAt(0).toUpperCase()}
                               </div>
                               <div>
                                   <h2 className="text-xl font-bold text-white">Editar Perfil</h2>
                                   <p className="text-sm text-slate-400">ID Terminal: <span className="font-mono text-white">{selectedUser.id}</span></p>
                               </div>
                           </div>
                           <button 
                                onClick={handleSaveUser}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[#53a653] text-white font-bold hover:bg-[#468f46] disabled:opacity-50 shadow-lg shadow-green-900/20"
                           >
                               {saving ? <span className="material-symbols-outlined animate-spin">sync</span> : <span className="material-symbols-outlined">save</span>}
                               Guardar
                           </button>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {/* Sección Datos Personales */}
                           <div className="flex flex-col gap-4">
                               <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Datos Personales</h3>
                               <div className="space-y-4">
                                   <div>
                                       <label className="block text-sm font-medium text-slate-400 mb-1">Nombre (Terminal)</label>
                                       <input 
                                         value={editForm.name}
                                         onChange={e => setEditForm({...editForm, name: e.target.value})}
                                         className="w-full rounded-lg bg-[#233648] border-slate-600 text-white focus:ring-primary focus:border-primary"
                                       />
                                   </div>
                                   <div>
                                       <label className="block text-sm font-medium text-slate-400 mb-1">Apellido</label>
                                       <input 
                                         value={editForm.lastname || ''}
                                         onChange={e => setEditForm({...editForm, lastname: e.target.value})}
                                         className="w-full rounded-lg bg-[#233648] border-slate-600 text-white focus:ring-primary focus:border-primary"
                                         placeholder="Ingrese apellido"
                                       />
                                   </div>
                                   <div>
                                       <label className="block text-sm font-medium text-slate-400 mb-1">CUIT / ARCA ID</label>
                                       <input 
                                         value={editForm.cuit || ''}
                                         onChange={e => setEditForm({...editForm, cuit: e.target.value})}
                                         className="w-full rounded-lg bg-[#233648] border-slate-600 text-white focus:ring-primary focus:border-primary"
                                         placeholder="20-XXXXXXXX-X"
                                       />
                                   </div>
                               </div>
                           </div>

                           {/* Sección Contacto y Ubicación */}
                           <div className="flex flex-col gap-4">
                               <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Contacto y Ubicación</h3>
                               <div className="space-y-4">
                                   <div>
                                       <label className="block text-sm font-medium text-slate-400 mb-1">Dirección</label>
                                       <input 
                                         value={editForm.address || ''}
                                         onChange={e => setEditForm({...editForm, address: e.target.value})}
                                         className="w-full rounded-lg bg-[#233648] border-slate-600 text-white focus:ring-primary focus:border-primary"
                                       />
                                   </div>
                                   <div className="grid grid-cols-2 gap-4">
                                       <div>
                                           <label className="block text-sm font-medium text-slate-400 mb-1">Localidad</label>
                                           <input 
                                             value={editForm.city || ''}
                                             onChange={e => setEditForm({...editForm, city: e.target.value})}
                                             className="w-full rounded-lg bg-[#233648] border-slate-600 text-white focus:ring-primary focus:border-primary"
                                           />
                                       </div>
                                       <div>
                                           <label className="block text-sm font-medium text-slate-400 mb-1">Provincia</label>
                                           <input 
                                             value={editForm.province || ''}
                                             onChange={e => setEditForm({...editForm, province: e.target.value})}
                                             className="w-full rounded-lg bg-[#233648] border-slate-600 text-white focus:ring-primary focus:border-primary"
                                           />
                                       </div>
                                   </div>
                                   <div className="grid grid-cols-2 gap-4">
                                       <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-1">Teléfono</label>
                                            <input 
                                              value={editForm.phone || ''}
                                              onChange={e => setEditForm({...editForm, phone: e.target.value})}
                                              className="w-full rounded-lg bg-[#233648] border-slate-600 text-white focus:ring-primary focus:border-primary"
                                            />
                                       </div>
                                       <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                                            <input 
                                              value={editForm.email || ''}
                                              onChange={e => setEditForm({...editForm, email: e.target.value})}
                                              className="w-full rounded-lg bg-[#233648] border-slate-600 text-white focus:ring-primary focus:border-primary"
                                            />
                                       </div>
                                   </div>
                               </div>
                           </div>
                           
                           {/* Sección Sistema */}
                           <div className="md:col-span-2 pt-4 border-t border-slate-700">
                               <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Permisos y Roles</h3>
                               <div className="flex gap-4">
                                   <div className="w-1/2">
                                       <label className="block text-sm font-medium text-slate-400 mb-1">Rol en Terminal</label>
                                       <select 
                                          value={editForm.role}
                                          onChange={e => setEditForm({...editForm, role: e.target.value as any})}
                                          className="w-full rounded-lg bg-[#233648] border-slate-600 text-white focus:ring-primary focus:border-primary"
                                       >
                                           <option value="User">Usuario Normal</option>
                                           <option value="Admin">Administrador</option>
                                       </select>
                                   </div>
                               </div>
                           </div>
                       </div>
                   </>
               ) : (
                   <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
                       <div className="p-6 rounded-full bg-[#192633]">
                           <span className="material-symbols-outlined text-6xl text-slate-600">person_search</span>
                       </div>
                       <div className="text-center">
                           <h3 className="text-xl font-bold text-white">Seleccione un usuario</h3>
                           <p className="max-w-xs mx-auto mt-2 text-sm">Haga clic en un usuario de la lista izquierda para ver y editar su perfil completo, CUIT y datos de contacto.</p>
                       </div>
                   </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;