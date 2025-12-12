import React, { useEffect, useState, useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper
} from '@tanstack/react-table';
import { Device, DeviceDiagnostics } from '../types';
import { DeviceService } from '../services/api';

const Devices: React.FC = () => {
    const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

    // Estados Edición
    // Modal borrar terminal
    const [deleteModal, setDeleteModal] = useState<{ open: boolean, device: Device | null }>({ open: false, device: null });
    // Columnas para TanStack Table
    const columnHelper = createColumnHelper<Device>();
    const columns = useMemo(() => [
        columnHelper.accessor('name', {
            header: 'Nombre',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('ip', {
            header: 'IP',
            cell: info => <span className="font-mono">{info.getValue()}</span>,
        }),
        columnHelper.accessor('port', {
            header: 'Puerto',
            cell: info => <span className="font-mono">{info.getValue()}</span>,
        }),
        columnHelper.accessor('mac', {
            header: 'MAC',
            cell: info => <span className="font-mono">{info.getValue()}</span>,
        }),
        columnHelper.accessor('firmware', {
            header: 'Firmware',
            cell: info => <span className="font-mono">{info.getValue()}</span>,
        }),
        columnHelper.display({
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <div className="relative inline-block text-left">
                    <button className="px-2 py-1 rounded hover:bg-slate-700" onClick={() => row.toggleExpanded()}>
                        <span className="material-symbols-outlined">more_vert</span>
                    </button>
                    {row.getIsExpanded() && (
                        <div className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-[#192633] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="py-1">
                                <button className="w-full px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 flex items-center gap-2" onClick={() => handleSyncInfo(row.original)}>
                                    <span className="material-symbols-outlined text-base">schedule</span> Poner en hora
                                </button>
                                <button className="w-full px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 flex items-center gap-2" onClick={handleGetRealInfo}>
                                    <span className="material-symbols-outlined text-base">refresh</span> Actualizar
                                </button>
                                <button className="w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 flex items-center gap-2" onClick={() => setDeleteModal({ open: true, device: row.original })}>
                                    <span className="material-symbols-outlined text-base">delete</span> Borrar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ),
        }),
    ], []);
    // Configuración de la tabla
    const table = useReactTable({
        data: devices,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getRowCanExpand: () => true,
        state: {},
    });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', ip: '', port: 4370 });

  // Estados para el Modal de Info Real
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStep, setConnectionStep] = useState<string>('');
  const [deviceResponse, setDeviceResponse] = useState<any | null>(null);
  

    // Estado Mock Live Capture
    const [liveCapture, setLiveCapture] = useState(false);

    // Modal alta terminal
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addForm, setAddForm] = useState({ name: '', ip: '', port: 4370 });
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState('');
    const [testResult, setTestResult] = useState<any | null>(null);
    const [testLoading, setTestLoading] = useState(false);

    const handleTestConnection = async () => {
        setTestLoading(true);
        setAddError('');
        setTestResult(null);
        try {
            const test = await DeviceService.getDeviceInfo(addForm.ip, addForm.port);
            if (!test.success || !test.data) {
                setAddError('No se pudo conectar a la terminal. Verifica la IP y el puerto.');
                setTestResult(null);
            } else {
                setTestResult(test.data);
            }
        } catch (e) {
            setAddError('No se pudo conectar a la terminal. Verifica la IP y el puerto.');
            setTestResult(null);
        }
        setTestLoading(false);
    };

    const handleAddDevice = async () => {
        if (!testResult) {
            setAddError('Primero debes probar la conexión y obtener los datos reales.');
            return;
        }
        setAddLoading(true);
        setAddError('');
        try {
            const res = await DeviceService.create({
                ...addForm,
                firmware: testResult.firmware || '',
                mac: testResult.serialnumber || '',
                model: testResult.platform || ''
            });
            if (res.success) {
                setIsAddModalOpen(false);
                setAddForm({ name: '', ip: '', port: 4370 });
                setTestResult(null);
                // Refrescar lista
                setLoading(true);
                const data = await DeviceService.getAll();
                setDevices(data);
                setLoading(false);
            } else {
                setAddError(res.message || 'Error al agregar terminal');
            }
        } catch (e) {
            setAddError('Error de red');
        }
        setAddLoading(false);
    };

    useEffect(() => {
        const fetchDevices = async () => {
            setLoading(true);
            const data = await DeviceService.getAll();
            // Para cada dispositivo, obtener info real de la terminal
            const enriched = await Promise.all(data.map(async (dev) => {
                try {
                    const res = await DeviceService.getDeviceInfo(dev.ip, dev.port || 4370);
                    if (res.success && res.data) {
                        return {
                            ...dev,
                            mac: res.data.serialnumber || '',
                            firmware: res.data.firmware || '',
                            model: res.data.platform || '',
                            status: 'Online' as const,
                            lastSeen: new Date().toLocaleString(),
                            capacity: res.data.capacity || undefined,
                        };
                    } else {
                        return { ...dev, status: 'Offline' as const };
                    }
                } catch {
                    return { ...dev, status: 'Offline' as const };
                }
            }));
            setDevices(enriched);
            if (enriched.length > 0) setSelectedDevice(enriched[0]);
            setLoading(false);
        };
        fetchDevices();
    }, []);

  // Polling updates
  useEffect(() => {
    const intervalId = setInterval(async () => {
        if(isEditing) return; // Don't refresh while editing
        const data = await DeviceService.getAll();
        setDevices(data);
        // Only update selected ref if not editing to avoid overwriting inputs
        setSelectedDevice(prev => {
            if(!prev) return null;
            const updated = data.find(d => d.id === prev.id);
            return updated || prev;
        });
    }, 10000); 
    return () => clearInterval(intervalId);
  }, [isEditing]);

  const handleSelectDevice = (dev: Device) => {
      setSelectedDevice(dev);
      setIsEditing(false); // Cancel edit on switch
  };

  const handleEdit = () => {
      if(!selectedDevice) return;
      setEditForm({ 
          name: selectedDevice.name, 
          ip: selectedDevice.ip, 
          port: selectedDevice.port || 4370 
      });
      setIsEditing(true);
  };

  const handleSaveDevice = async () => {
      if(!selectedDevice) return;
      const success = await DeviceService.update(selectedDevice.id, editForm);
      if(success) {
          setIsEditing(false);
          // Manually update local state to reflect changes immediately
          const updatedDevices = devices.map(d => d.id === selectedDevice.id ? { ...d, ...editForm } : d);
          setDevices(updatedDevices);
          setSelectedDevice({ ...selectedDevice, ...editForm });
      } else {
          alert('Error al actualizar dispositivo.');
      }
  };

  const handleSyncInfo = async (device: Device) => {
      if(!window.confirm(`¿Sincronizar Hora y Datos Técnicos con ${device.name}?`)) return;
      const success = await DeviceService.syncInfoOnly(device.id);
      if(success) alert('Hora y datos sincronizados correctamente.');
      else alert('Error de sincronización.');
  };

  const handleGetRealInfo = async () => {
      if (!selectedDevice) return;
      setIsInfoModalOpen(true);
      setIsConnecting(true);
      setDeviceResponse(null);
      setConnectionStep('Iniciando handshake ZKTeco...');

      const timer1 = setTimeout(() => setConnectionStep('Conectando socket TCP...'), 800);
      const timer2 = setTimeout(() => setConnectionStep('Leyendo datos biométricos...'), 2000);

      try {
          const result = await DeviceService.getDeviceInfo(selectedDevice.id);
          clearTimeout(timer1);
          clearTimeout(timer2);
          setConnectionStep('Procesando respuesta...');
          setTimeout(() => {
             setDeviceResponse(result);
             setIsConnecting(false);
          }, 500);
      } catch (e) {
          setDeviceResponse({ success: false, message: "Error crítico en cliente Frontend." });
          setIsConnecting(false);
      }
  };

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
                    <button
                        className="flex h-10 min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg bg-primary px-4 text-sm font-bold text-white transition-colors hover:bg-primary/90"
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        {/* Modal alta terminal */}
                        {isAddModalOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                                <div className="w-full max-w-md rounded-xl border border-slate-700 bg-[#111a22] shadow-2xl overflow-hidden flex flex-col">
                                    <div className="flex items-center justify-between border-b border-slate-700 bg-[#192633] px-6 py-4 shrink-0">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <span className="material-symbols-outlined">add</span>
                                            Nueva Terminal
                                        </h3>
                                        <button
                                            onClick={() => setIsAddModalOpen(false)}
                                            disabled={addLoading}
                                            className="rounded-lg p-1 text-slate-400 hover:bg-slate-700 hover:text-white disabled:opacity-50"
                                        >
                                            <span className="material-symbols-outlined">close</span>
                                        </button>
                                    </div>
                                    <form className="flex flex-col gap-4 p-6" onSubmit={e => { e.preventDefault(); handleAddDevice(); }}>
                                        <input
                                            className="rounded bg-slate-900 border border-slate-600 text-white px-2 py-2 text-sm font-bold"
                                            value={addForm.name}
                                            onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                                            placeholder="Nombre de la terminal"
                                            required
                                        />
                                        <input
                                            className="rounded bg-slate-900 border border-slate-600 text-white px-2 py-2 text-sm font-mono"
                                            value={addForm.ip}
                                            onChange={e => setAddForm(f => ({ ...f, ip: e.target.value }))}
                                            placeholder="IP (ej: 192.168.1.100)"
                                            required
                                        />
                                        <input
                                            type="number"
                                            className="rounded bg-slate-900 border border-slate-600 text-white px-2 py-2 text-sm font-mono"
                                            value={addForm.port}
                                            onChange={e => setAddForm(f => ({ ...f, port: parseInt(e.target.value) }))}
                                            placeholder="Puerto (ej: 4370)"
                                            required
                                            min={1}
                                            max={65535}
                                        />
                                        <button type="button" onClick={handleTestConnection} disabled={testLoading} className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 font-bold mt-2">{testLoading ? 'Probando...' : 'Probar conexión'}</button>
                                        {testResult && (
                                            <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3 flex items-center gap-3 mt-2">
                                                <span className="material-symbols-outlined text-green-500 text-2xl">check_circle</span>
                                                <div>
                                                    <h4 className="font-bold text-white">Conexión Exitosa</h4>
                                                    <p className="text-xs text-green-200">La terminal respondió correctamente.</p>
                                                </div>
                                            </div>
                                        )}
                                        {addError && <div className="text-red-400 text-sm">{addError}</div>}
                                        <div className="flex gap-2 justify-end mt-2">
                                            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30">Cancelar</button>
                                            <button type="submit" disabled={addLoading || !testResult} className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 font-bold">{addLoading ? 'Agregando...' : 'Agregar'}</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
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
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-300">
                                <thead className="text-xs uppercase text-slate-400">
                                    {table.getHeaderGroups().map(headerGroup => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map(header => (
                                                <th key={header.id} className="px-4 py-2">{flexRender(header.column.columnDef.header, header.getContext())}</th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={columns.length} className="p-8 text-center text-slate-400">Buscando terminales...</td></tr>
                                    ) : devices.length === 0 ? (
                                        <tr><td colSpan={columns.length} className="p-8 text-center text-slate-400">No hay terminales en el sistema</td></tr>
                                    ) : devices.map((row, i) => {
                                        const tableRow = table.getRowModel().rows[i];
                                        return (
                                            <tr key={row.id} className={`border-b border-slate-200/10 cursor-pointer transition-colors ${selectedDevice?.id === row.id ? 'bg-primary/10' : 'hover:bg-slate-500/10'}`}
                                                onClick={() => handleSelectDevice(row)}>
                                                {tableRow.getVisibleCells().map(cell => (
                                                    <td key={cell.id} className="px-4 py-2">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                                                ))}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/* Modal de confirmación para borrar terminal */}
                    {deleteModal.open && deleteModal.device && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                            <div className="w-full max-w-sm rounded-xl border border-slate-700 bg-[#111a22] shadow-2xl overflow-hidden flex flex-col">
                                <div className="flex items-center justify-between border-b border-slate-700 bg-[#192633] px-6 py-4 shrink-0">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-red-400">warning</span>
                                        Confirmar Borrado
                                    </h3>
                                    <button onClick={() => setDeleteModal({ open: false, device: null })} className="rounded-lg p-1 text-slate-400 hover:bg-slate-700 hover:text-white">
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                </div>
                                <div className="p-6">
                                    <p className="text-white mb-4">¿Seguro que deseas borrar la terminal <b>{deleteModal.device.name}</b> ({deleteModal.device.ip})?</p>
                                    <div className="flex gap-2 justify-end">
                                        <button onClick={() => setDeleteModal({ open: false, device: null })} className="px-3 py-1 bg-slate-700 text-white rounded text-xs hover:bg-slate-600">Cancelar</button>
                                        <button onClick={async () => {
                                            // Lógica de borrado aquí
                                            await DeviceService.delete(deleteModal.device.id);
                                            setDeleteModal({ open: false, device: null });
                                            setLoading(true);
                                            const data = await DeviceService.getAll();
                                            setDevices(data);
                                            setLoading(false);
                                        }} className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 font-bold">Aplicar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
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
                    <div className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-[#233648] ${selectedDevice.status === 'Online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
                
                {isEditing ? (
                   <div className="flex flex-col gap-2 w-full">
                       <input 
                         className="w-full rounded bg-slate-900 border border-slate-600 text-white px-2 py-1 text-sm font-bold"
                         value={editForm.name}
                         onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                         placeholder="Nombre Dispositivo"
                       />
                       <input 
                         className="w-full rounded bg-slate-900 border border-slate-600 text-slate-300 px-2 py-1 text-sm font-mono"
                         value={editForm.ip}
                         onChange={(e) => setEditForm({...editForm, ip: e.target.value})}
                         placeholder="192.168.1.X"
                       />
                       <div className="flex gap-2 justify-center mt-2">
                           <button onClick={() => setIsEditing(false)} className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30">Cancelar</button>
                           <button onClick={handleSaveDevice} className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 font-bold">Guardar</button>
                       </div>
                   </div>
                ) : (
                   <div className="text-center group relative">
                      <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                          {selectedDevice.name}
                          <button onClick={handleEdit} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-white">
                             <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                      </h3>
                      <p className="text-sm text-slate-400">{selectedDevice.ip}</p>
                   </div>
                )}
                
                <div className="text-center px-4 py-2 bg-black/20 rounded text-xs text-slate-400">
                    Conexión bajo demanda (Control Horario)
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
                         <button 
                            onClick={() => setLiveCapture(!liveCapture)}
                            title="Monitor continuo para control de accesos. Mantiene la conexión abierta."
                            className={`flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium text-white transition-all ${liveCapture ? 'bg-red-600 hover:bg-red-500 animate-pulse' : 'bg-[#233648] hover:bg-[#344a60]'}`}
                         >
                            <span className="material-symbols-outlined text-lg">videocam</span> 
                            {liveCapture ? 'Desconectar' : 'Live Mode'}
                        </button>
                        <button onClick={() => handleSyncInfo(selectedDevice)} className="flex items-center justify-center gap-2 rounded-lg bg-[#233648] py-3 text-sm font-medium text-white hover:bg-[#344a60]">
                            <span className="material-symbols-outlined text-lg">sync</span> Sync Hora
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Configuración Estática</h4>
                <div className="flex flex-col rounded-lg bg-[#192633] p-4">
                  <div className="space-y-3 text-sm">
                      <div className="flex justify-between border-b border-slate-700 pb-2 items-center">
                        <span className="text-slate-400">Puerto de Comando</span>
                        {isEditing ? (
                           <input 
                             type="number"
                             className="w-20 rounded bg-slate-900 border border-slate-600 text-white px-1 py-0.5 text-right font-mono"
                             value={editForm.port}
                             onChange={(e) => setEditForm({...editForm, port: parseInt(e.target.value)})}
                           />
                        ) : (
                           <span className="font-mono text-white">{selectedDevice.port || 4370}</span>
                        )}
                      </div>
                      <div className="flex justify-between border-b border-slate-700 pb-2">
                        <span className="text-slate-400">MAC Address</span>
                        <span className="font-mono text-white">{selectedDevice.mac}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Modelo Detectado</span>
                        <span className="font-medium text-white">{selectedDevice.model}</span>
                      </div>
                  </div>
                </div>
                                {/* Tabla de información completa de la terminal */}
                                <div className="flex flex-col rounded-lg bg-[#192633] p-4 mt-4">
                                    <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">Información de la Terminal</h4>
                                    <table className="w-full text-xs text-slate-300">
                                        <tbody>
                                            <tr>
                                                <td className="py-1 pr-2 text-slate-400">Firmware</td>
                                                <td className="py-1 font-mono text-white">{selectedDevice.firmware || 'N/A'}</td>
                                            </tr>
                                            <tr>
                                                <td className="py-1 pr-2 text-slate-400">MAC/Serial</td>
                                                <td className="py-1 font-mono text-white">{selectedDevice.mac || 'N/A'}</td>
                                            </tr>
                                            <tr>
                                                <td className="py-1 pr-2 text-slate-400">Modelo</td>
                                                <td className="py-1 font-mono text-white">{selectedDevice.model || 'N/A'}</td>
                                            </tr>
                                            <tr>
                                                <td className="py-1 pr-2 text-slate-400">Estado</td>
                                                <td className="py-1 font-mono text-white">{selectedDevice.status || 'N/A'}</td>
                                            </tr>
                                            <tr>
                                                <td className="py-1 pr-2 text-slate-400">Última conexión</td>
                                                <td className="py-1 font-mono text-white">{selectedDevice.lastSeen || 'N/A'}</td>
                                            </tr>
                                            {/* Si hay campos de memoria, usuarios, logs, etc. */}
                                            {selectedDevice.capacity && (
                                                <>
                                                    <tr>
                                                        <td className="py-1 pr-2 text-slate-400">Usuarios</td>
                                                        <td className="py-1 font-mono text-white">{selectedDevice.capacity.userCount} / {selectedDevice.capacity.userCapacity}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="py-1 pr-2 text-slate-400">Huellas</td>
                                                        <td className="py-1 font-mono text-white">{selectedDevice.capacity.fingerprintCount} / {selectedDevice.capacity.fingerprintCapacity}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="py-1 pr-2 text-slate-400">Registros (Logs)</td>
                                                        <td className="py-1 font-mono text-white">{selectedDevice.capacity.logCount} / {selectedDevice.capacity.logCapacity}</td>
                                                    </tr>
                                                </>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
            </div>
            </aside>
        )}
      </div>
      
      {/* Modal de Info Real se mantiene igual (omitiendo por brevedad ya que no cambia lógica, solo se re-renderiza) */}
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
                             </div>
                          </div>
                      ) : deviceResponse ? (
                          deviceResponse.success ? (
                              <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-300">
                                  <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4 flex items-center gap-3">
                                      <span className="material-symbols-outlined text-green-500 text-3xl">check_circle</span>
                                      <div>
                                          <h4 className="font-bold text-white">Conexión Exitosa</h4>
                                          <p className="text-xs text-green-200">Datos obtenidos directamente del hardware ZKTeco.</p>
                                      </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                      <div className="rounded-lg bg-[#192633] p-4 border border-slate-700">
                                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Hora del Dispositivo</span>
                                          <div className="mt-1 text-lg font-mono font-bold text-white">{deviceResponse.data.deviceTime.split(' ')[1]}</div>
                                          <div className="text-xs text-slate-500">{deviceResponse.data.deviceTime.split(' ')[0]}</div>
                                      </div>
                                      <div className="rounded-lg bg-[#192633] p-4 border border-slate-700">
                                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Firmware</span>
                                          <div className="mt-1 text-sm font-bold text-white truncate" title={deviceResponse.data.firmwareVersion}>{deviceResponse.data.firmwareVersion}</div>
                                          <div className="text-xs text-slate-500">{deviceResponse.data.platform}</div>
                                      </div>
                                  </div>
                                  <div className="space-y-4">
                                      <h4 className="text-sm font-bold text-white border-b border-slate-700 pb-2">Uso de Memoria</h4>
                                      <div>
                                          <div className="flex justify-between text-xs mb-1">
                                              <span className="text-slate-300">Usuarios</span>
                                              <span className="text-slate-400">{deviceResponse.data.capacity.userCount} / {deviceResponse.data.capacity.userCapacity}</span>
                                          </div>
                                          <div className="h-2 w-full rounded-full bg-slate-700 overflow-hidden">
                                              <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${calcPercent(deviceResponse.data.capacity.userCount, deviceResponse.data.capacity.userCapacity)}%` }}></div>
                                          </div>
                                      </div>
                                      <div>
                                          <div className="flex justify-between text-xs mb-1">
                                              <span className="text-slate-300">Huellas</span>
                                              <span className="text-slate-400">{deviceResponse.data.capacity.fingerprintCount} / {deviceResponse.data.capacity.fingerprintCapacity}</span>
                                          </div>
                                          <div className="h-2 w-full rounded-full bg-slate-700 overflow-hidden">
                                              <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${calcPercent(deviceResponse.data.capacity.fingerprintCount, deviceResponse.data.capacity.fingerprintCapacity)}%` }}></div>
                                          </div>
                                      </div>
                                      <div>
                                          <div className="flex justify-between text-xs mb-1">
                                              <span className="text-slate-300">Registros (Logs)</span>
                                              <span className="text-slate-400">{deviceResponse.data.capacity.logCount} / {deviceResponse.data.capacity.logCapacity}</span>
                                          </div>
                                          <div className="h-2 w-full rounded-full bg-slate-700 overflow-hidden">
                                              <div className={`h-full transition-all duration-500 ${calcPercent(deviceResponse.data.capacity.logCount, deviceResponse.data.capacity.logCapacity) > 90 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${calcPercent(deviceResponse.data.capacity.logCount, deviceResponse.data.capacity.logCapacity)}%` }}></div>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          ) : (
                              <div className="flex flex-col items-center animate-in zoom-in duration-300 py-6">
                                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 text-red-500">
                                      <span className="material-symbols-outlined text-4xl">cloud_off</span>
                                  </div>
                                  <h4 className="text-xl font-bold text-white mb-2">Fallo en la Conexión</h4>
                                  <p className="text-white bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-center text-sm font-medium px-4 mb-4 w-full">
                                    {deviceResponse.message}
                                  </p>
                                  <button onClick={handleGetRealInfo} className="mt-6 text-primary hover:underline text-sm font-bold flex items-center gap-1">
                                    <span className="material-symbols-outlined">refresh</span>
                                    Reintentar Conexión
                                  </button>
                              </div>
                          )
                      ) : null}
                  </div>
                  <div className="border-t border-slate-700 bg-[#192633] px-6 py-4 flex justify-end shrink-0">
                      <button onClick={() => setIsInfoModalOpen(false)} disabled={isConnecting} className="rounded-lg bg-[#233648] px-4 py-2 text-sm font-bold text-white hover:bg-[#344a60] disabled:opacity-50">Cerrar</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Devices;