import React from 'react';

const Events: React.FC = () => {
  return (
    <div className="flex h-full flex-col p-8 bg-[#101922]">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold leading-tight tracking-[-0.03em] text-white">Registros de Eventos</h1>
            <p className="text-base font-normal leading-normal text-[#92adc9]">Ver y gestionar registros de eventos de todos los dispositivos conectados.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex h-10 min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg border border-[#324d67] bg-[#233648] px-4 text-sm font-bold leading-normal tracking-[0.015em] text-white transition-colors hover:bg-[#2a3f55]">
              <span className="material-symbols-outlined text-base">refresh</span>
              <span className="truncate">Actualizar</span>
            </button>
            <button className="flex h-10 min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg bg-primary px-4 text-sm font-bold leading-normal tracking-[0.015em] text-white transition-colors hover:bg-primary/90">
              <span className="material-symbols-outlined text-base">download</span>
              <span className="truncate">Exportar</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 rounded-xl border border-[#324d67] bg-[#192633] p-6">
          <h3 className="text-lg font-bold leading-tight tracking-[-0.015em] text-white">Filtrar y Buscar</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <label className="flex h-12 w-full min-w-40 flex-col lg:col-span-2">
              <div className="flex h-full w-full flex-1 items-stretch rounded-lg">
                <div className="flex items-center justify-center rounded-l-lg border border-r-0 border-[#324d67] bg-[#233648] pl-4 text-[#92adc9]">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <input
                  className="flex h-full w-full flex-1 resize-none overflow-hidden rounded-r-lg border border-[#324d67] bg-[#192633] px-4 pl-3 text-base font-normal leading-normal text-white placeholder-[#92adc9] focus:outline-0 focus:ring-2 focus:ring-primary/50"
                  placeholder="Buscar por usuario, dispositivo o detalles..."
                  defaultValue=""
                />
              </div>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex flex-col">
                <input
                  className="flex h-12 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border border-[#324d67] bg-[#192633] px-3 text-base font-normal leading-normal text-white placeholder-[#92adc9] focus:outline-0 focus:ring-2 focus:ring-primary/50"
                  type="date"
                  defaultValue="2023-10-27"
                />
              </label>
              <label className="flex flex-col">
                <input
                  className="flex h-12 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border border-[#324d67] bg-[#192633] px-3 text-base font-normal leading-normal text-white placeholder-[#92adc9] focus:outline-0 focus:ring-2 focus:ring-primary/50"
                  type="date"
                  defaultValue="2023-11-27"
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select className="flex h-12 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border border-[#324d67] bg-[#192633] px-3 text-base font-normal leading-normal text-white placeholder-[#92adc9] focus:outline-0 focus:ring-2 focus:ring-primary/50">
                <option>Todos los tipos</option>
                <option>Acceso Concedido</option>
                <option>Fichaje</option>
                <option>Error</option>
              </select>
              <select className="flex h-12 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border border-[#324d67] bg-[#192633] px-3 text-base font-normal leading-normal text-white placeholder-[#92adc9] focus:outline-0 focus:ring-2 focus:ring-primary/50">
                <option>Todos</option>
                <option>Entrada Principal</option>
                <option>Sala de Servidores</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="w-full overflow-hidden rounded-xl border border-[#324d67]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#192633] text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold">Marca de Tiempo</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Evento</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Usuario</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Dispositivo</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#233648] bg-[#111a22]">
                <tr>
                  <td className="whitespace-nowrap px-6 py-4">2023-10-27 09:01:15</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-300">
                      <span className="size-1.5 rounded-full bg-green-500"></span>
                      Fichaje (Éxito)
                    </span>
                  </td>
                  <td className="px-6 py-4">John Doe (101)</td>
                  <td className="px-6 py-4">Entrada Principal</td>
                  <td className="px-6 py-4">Verificado por Huella Dactilar</td>
                </tr>
                <tr className="bg-[#192633]/50">
                  <td className="whitespace-nowrap px-6 py-4">2023-10-27 09:03:45</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 px-2 py-1 text-xs font-medium text-red-300">
                      <span className="size-1.5 rounded-full bg-red-500"></span>
                      Acceso Denegado (Error)
                    </span>
                  </td>
                  <td className="px-6 py-4">Jane Smith (102)</td>
                  <td className="px-6 py-4">Sala de Servidores</td>
                  <td className="px-6 py-4">Credenciales Inválidas</td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap px-6 py-4">2023-10-27 09:05:21</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-2 py-1 text-xs font-medium text-blue-300">
                      <span className="size-1.5 rounded-full bg-blue-500"></span>
                      Reinicio del Sistema
                    </span>
                  </td>
                  <td className="px-6 py-4">SISTEMA</td>
                  <td className="px-6 py-4">Entrada Principal</td>
                  <td className="px-6 py-4">Dispositivo reiniciado con éxito.</td>
                </tr>
                <tr className="bg-[#192633]/50">
                   <td className="whitespace-nowrap px-6 py-4">2023-10-27 09:11:03</td>
                   <td className="px-6 py-4">
                     <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-300">
                       <span className="size-1.5 rounded-full bg-green-500"></span>
                       Acceso Concedido
                     </span>
                   </td>
                   <td className="px-6 py-4">Peter Jones (103)</td>
                   <td className="px-6 py-4">Sala de Servidores</td>
                   <td className="px-6 py-4">Verificado por Tarjeta</td>
                 </tr>
                 <tr>
                   <td className="whitespace-nowrap px-6 py-4">2023-10-27 09:15:56</td>
                   <td className="px-6 py-4">
                     <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/20 px-2 py-1 text-xs font-medium text-yellow-300">
                       <span className="size-1.5 rounded-full bg-yellow-500"></span>
                       Conexión Perdida
                     </span>
                   </td>
                   <td className="px-6 py-4">SISTEMA</td>
                   <td className="px-6 py-4">Puerta del Almacén</td>
                   <td className="px-6 py-4">El dispositivo está desconectado.</td>
                 </tr>
              </tbody>
            </table>
          </div>
          
          <nav className="flex flex-col items-start justify-between space-y-3 bg-[#111a22] p-4 md:flex-row md:items-center md:space-y-0">
             <span className="text-sm font-normal text-slate-400">
                Mostrando <span className="font-semibold text-white">1-5</span> de <span className="font-semibold text-white">100</span>
             </span>
             <ul className="inline-flex -space-x-px items-stretch">
                <li>
                   <a href="#" className="flex h-full items-center justify-center rounded-l-lg border border-[#324d67] bg-[#192633] px-3 py-1.5 text-slate-400 hover:bg-[#233648] hover:text-white">
                      <span className="sr-only">Anterior</span>
                      <span className="material-symbols-outlined text-lg">chevron_left</span>
                   </a>
                </li>
                <li>
                   <a href="#" className="flex items-center justify-center border border-primary bg-primary px-3 py-2 text-sm leading-tight text-white">1</a>
                </li>
                <li>
                   <a href="#" className="flex items-center justify-center border border-[#324d67] bg-[#192633] px-3 py-2 text-sm leading-tight text-slate-400 hover:bg-[#233648] hover:text-white">2</a>
                </li>
                <li>
                   <a href="#" className="flex items-center justify-center border border-[#324d67] bg-[#192633] px-3 py-2 text-sm leading-tight text-slate-400 hover:bg-[#233648] hover:text-white">3</a>
                </li>
                <li>
                   <a href="#" className="flex h-full items-center justify-center rounded-r-lg border border-[#324d67] bg-[#192633] px-3 py-1.5 text-slate-400 hover:bg-[#233648] hover:text-white">
                      <span className="sr-only">Siguiente</span>
                      <span className="material-symbols-outlined text-lg">chevron_right</span>
                   </a>
                </li>
             </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Events;
