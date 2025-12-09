import React from 'react';

const Users: React.FC = () => {
  return (
    <div className="flex h-screen flex-col bg-[#101922]">
      <div className="flex-1 overflow-y-auto p-8">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] text-white">Gestión de Usuarios</h1>
          </div>
          
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* User List Panel */}
            <div className="flex flex-col gap-4 rounded-xl border border-slate-700 bg-[#111a22] p-6 lg:col-span-1">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-bold text-white">Todos los Usuarios</h2>
                <button className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold tracking-[0.015em] text-white">
                  <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>add</span>
                  <span>Agregar</span>
                </button>
              </div>
              
              <div>
                 <label className="flex h-12 w-full flex-col">
                    <div className="flex h-full w-full flex-1 items-stretch rounded-lg bg-[#233648]">
                       <div className="flex items-center justify-center rounded-l-lg pl-4 text-[#92adc9]">
                          <span className="material-symbols-outlined">search</span>
                       </div>
                       <input 
                          className="flex h-full w-full flex-1 resize-none overflow-hidden rounded-lg border-none bg-transparent px-2 text-sm font-normal leading-normal text-white placeholder-[#92adc9] focus:outline-0 focus:ring-0" 
                          placeholder="Buscar por nombre, ID o email..." 
                       />
                    </div>
                 </label>
              </div>

              <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto -mx-2 pr-2">
                 {[
                    { id: '1001', name: 'Alex Johnson', status: 'Activo', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlHMEQNIv413vlrFbhx--dzKQiZjhC3mEsbGBfGLRSJNT1hD8vCi96ToOLboCl6mJ62xWQCOghS0wlySo1bD26BWMnM8B92vgqsIqt-SfGMZWR4cp9stbrw5ld0gVkkSAY6OydFbiJlemvU01fv_GrbmLiRlfXkchrGuVFOk-5ibMsVgXkCo_SZ_NxMhxgIrDguqCB3EOz7TXWBkoy_TIwERRWoPE8ys2zYYligFl66svSM-61xD8vQAaL-zN-SyOgWjmxMuY0C7E', active: true },
                    { id: '1002', name: 'Maria Garcia', status: 'Activo', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDK-vVHD2qXrYCHhZQisn8h261EX5sexRR9eBq7qE5tIT7WEBoEzECmfWSQ5LguAKUPj_rJf18_DykslYNp-kC4JZP84tSA2VQGIkI_EP6uxuLejKMWUBd_zY488_STyKy8RGK22twYT8yF48zlT0lTq6Lu3B-gE0_14Kt3wv63RWEbk59qVT5xH-DOcTklB_SkJOOh1kJpKzFBM-NVShJ_FdiJ7noS_Qfxup5QWX4LIi92t9aIZcy_PHn6cIwx1Mu1i5JK0Jv-0zc', active: false },
                    { id: '1003', name: 'Chen Wei', status: 'Inactivo', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQomFo7JytEzUIj8G85B84rZ7jNxUS6zfIJ2zEiLtXEwomAwD9Nfcjouu9XRd90t24NXUsbPTYPhxpWSpUZcLQ8xPqEsh_8HGEXRLfUpkpQg7Sfo8T2yU9h1acFQQkYiQ83tpahfFooNcd6AHGLxXrpNk_LODjQDeC5m_BeTZ2YRXUcQtcQUjgUgX7VWwm46OR2gTBb0FUykU7ntbo9RUQaprELrGIf6rN_V1UuJRnxBlPNG7_xvBKW8G4xdY6nzJ82OzyX8GIHdE', active: false, isInactive: true },
                    { id: '1004', name: 'Emily Carter', status: 'Activo', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArSdmoxuH14fTtJ9sQZrRDtsmTs8Sta01WZu6Xx9Qf7KF6URUeGOeBToqd6Ndz5yAExfUbWeOG8__qGxVQmXjpgLnv9FIc2iy7D3Vd2nT4jh1XCVXaf9R6faFOKBEg2I7ABvZ5AIVZE2giRmQ3IxwNz3lrKvTQkxHqjWW8bSgkQAdKs4gZrESYzW38F4Jtq8axCSH88gkJkco26jIQtm8lZNQUUjv9SoOtzQBiq5iypqa47t9jSWcCkLUU9DHlPsk0nS0bKC0nzL8', active: false },
                    { id: '1005', name: 'David Smith', status: 'Activo', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5vNUn_o5FgLASToaGCjvf3KMmR8K_x2R1QF_xVmvj0ot_d45LS1_rmnnWdGdOyz811eKOwczVG63MsjNsP2Z7yBji0LuIEiZVESvZLmMFbrerjtxqI8e6wLuLsOp9ONU295EMiYLr4eaaX5NCpqQRKCVmpS1V9pJi8D-X0tewDPKPuUktLrOGqeqiz5KbFEoafIReIydRarEDIanBu3_-6O7QqrjrczoKtNsaUh3CzYjDag77t6IrDQuoXJaWGzUW4um5iJgodxY', active: false },
                 ].map((user) => (
                    <div key={user.id} className={`flex cursor-pointer items-center gap-4 rounded-lg p-2 ${user.active ? 'bg-primary/30' : 'hover:bg-slate-800/50'}`}>
                       <img alt={user.name} className="h-10 w-10 rounded-full object-cover" src={user.img} />
                       <div className="flex-1">
                          <p className="font-semibold text-white">{user.name}</p>
                          <p className="text-sm text-slate-400">ID: {user.id}</p>
                       </div>
                       <span className={`rounded-full px-2 py-1 text-xs font-medium ${user.isInactive ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                          {user.status}
                       </span>
                    </div>
                 ))}
              </div>
            </div>

            {/* Edit User Panel */}
            <div className="flex flex-col rounded-xl border border-slate-700 bg-[#111a22] p-6 lg:col-span-2">
               <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                     <h2 className="text-lg font-bold text-white">Editar Usuario: Alex Johnson</h2>
                     <button className="flex items-center gap-2 rounded-lg p-2 text-sm font-medium text-red-400 hover:bg-red-500/10">
                        <span className="material-symbols-outlined">delete</span>
                        Eliminar Usuario
                     </button>
                  </div>
                  
                  <div className="flex border-b border-slate-700">
                     <button className="border-b-2 border-primary px-4 py-3 text-sm font-medium text-primary">Detalles del Perfil</button>
                     <button className="px-4 py-3 text-sm font-medium text-slate-400 hover:text-white">Permisos de Acceso</button>
                  </div>

                  <div className="flex-grow overflow-y-auto py-6">
                     <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
                        <div>
                           <label className="text-sm font-medium text-slate-300">ID de Usuario</label>
                           <input disabled className="mt-1 block w-full rounded-lg border-slate-600 bg-[#233648] text-white focus:border-primary focus:ring-primary" type="text" defaultValue="1001" />
                        </div>
                        <div>
                           <label className="text-sm font-medium text-slate-300">Nombre Completo</label>
                           <input className="mt-1 block w-full rounded-lg border-slate-600 bg-[#233648] text-white focus:border-primary focus:ring-primary" type="text" defaultValue="Alex Johnson" />
                        </div>
                        <div>
                           <label className="text-sm font-medium text-slate-300">Correo Electrónico</label>
                           <input className="mt-1 block w-full rounded-lg border-slate-600 bg-[#233648] text-white focus:border-primary focus:ring-primary" type="email" defaultValue="alex.j@example.com" />
                        </div>
                        <div>
                           <label className="text-sm font-medium text-slate-300">Departamento</label>
                           <input className="mt-1 block w-full rounded-lg border-slate-600 bg-[#233648] text-white focus:border-primary focus:ring-primary" type="text" defaultValue="Ingeniería" />
                        </div>

                        <div className="md:col-span-2">
                           <label className="text-sm font-medium text-slate-300">Estado de la Cuenta</label>
                           <div className="mt-2 flex items-center">
                              <label className="flex cursor-pointer items-center">
                                 <div className="relative">
                                    <input type="checkbox" className="peer sr-only" defaultChecked />
                                    <div className="block h-8 w-14 rounded-full bg-slate-600 peer-checked:bg-[#137fec]"></div>
                                    <div className="dot absolute left-1 top-1 h-6 w-6 rounded-full bg-white transition peer-checked:translate-x-full"></div>
                                 </div>
                                 <div className="ml-3 font-medium text-slate-300">Activo</div>
                              </label>
                           </div>
                        </div>

                        <div className="md:col-span-2">
                           <label className="text-sm font-medium text-slate-300">Datos Biométricos</label>
                           <div className="mt-2 space-y-2">
                              <div className="flex items-center justify-between rounded-lg bg-slate-800/50 p-3">
                                 <span className="text-slate-300">Huella Dactilar Registrada</span>
                                 <span className="text-sm font-semibold text-green-400">Sí</span>
                              </div>
                              <div className="flex items-center justify-between rounded-lg bg-slate-800/50 p-3">
                                 <span className="text-slate-300">Rostro Registrado</span>
                                 <span className="text-sm font-semibold text-red-400">No</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                  
                  <div className="mt-auto flex justify-end gap-3 border-t border-slate-700 pt-4">
                     <button className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-bold text-white hover:bg-slate-600">Cancelar</button>
                     <button className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90">Guardar Cambios</button>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
