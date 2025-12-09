
import React, { useState, useEffect } from 'react';
import { SettingsService, DatabaseService } from '../services/api';
import { SystemSettings } from '../types';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'basic' | 'transfer' | 'tasks' | 'api' | 'db'>('basic');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Estado DB
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [loadingDb, setLoadingDb] = useState(false);

  // Estado inicial
  const [settings, setSettings] = useState<SystemSettings>({
    communication: { 
        defaultPort: 4370, 
        connectionTimeout: 5, 
        retryCount: 1, 
        serverIp: '', 
        serverPort: 8000,
        apiUrl: 'http://localhost:8000/api',
        useMockApi: false
    },
    data: {
        clearLogsAfterDownload: false
    }
  });

  // Cargar configuración al iniciar
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      const data = await SettingsService.get();
      setSettings(data);
      setLoading(false);
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await SettingsService.update(settings);
    setSaving(false);
    alert('Configuración guardada correctamente. Los cambios se aplicarán inmediatamente.');
  };

  const updateSetting = (section: 'communication', key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };
  
  const updateDataSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [key]: value
      }
    }));
  };

  // --- DB LOGIC ---
  const checkDbStatus = async () => {
      setLoadingDb(true);
      const status = await DatabaseService.getStatus();
      setDbStatus(status);
      setLoadingDb(false);
  };

  useEffect(() => {
      if (activeTab === 'db') {
          checkDbStatus();
      }
  }, [activeTab]);

  const handleCreateDb = async () => {
      if(!confirm("Esto creará las tablas necesarias si no existen. ¿Continuar?")) return;
      const res = await DatabaseService.init();
      alert(res.message);
      checkDbStatus();
  };

  const handleBackupDb = async () => {
      setLoadingDb(true);
      const res = await DatabaseService.backup();
      alert(res.message);
      setLoadingDb(false);
  };

  const handleOptimizeDb = async () => {
      const res = await DatabaseService.optimize();
      alert(res.message);
      checkDbStatus(); // El tamaño puede cambiar
  };


  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-[#101922] text-slate-400">Cargando configuración...</div>;
  }

  return (
    <div className="flex h-screen flex-col bg-[#101922] p-8 overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-6 flex flex-col gap-3">
          <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] text-white">Configuración</h1>
          <p className="text-base font-normal leading-normal text-[#92adc9]">Gestione los parámetros globales del sistema y la comunicación.</p>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-6 flex overflow-x-auto border-b border-[#324d67]">
          {[
            { id: 'basic', label: 'Ajustes Básicos' },
            { id: 'transfer', label: 'Conexión' },
            { id: 'db', label: 'Base de Datos' },
            { id: 'tasks', label: 'Tareas Programadas' },
            { id: 'api', label: 'Dev API' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`whitespace-nowrap border-b-2 px-6 py-3 text-sm font-bold transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-400 hover:text-white hover:border-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="flex flex-col gap-8">
          
          {/* TAB: AJUSTES BÁSICOS */}
          {activeTab === 'basic' && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              
              {/* Descarga de Eventos */}
              <section className="rounded-xl border border-[#324d67] bg-[#111a22] p-6">
                 <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">Descarga de Eventos</h3>
                 <div className="flex items-center">
                    <label className="flex cursor-pointer items-center gap-3">
                       <input 
                           type="checkbox" 
                           className="h-5 w-5 rounded border-slate-600 bg-[#233648] text-primary focus:ring-offset-0"
                           checked={settings.data?.clearLogsAfterDownload || false}
                           onChange={(e) => updateDataSetting('clearLogsAfterDownload', e.target.checked)}
                       />
                       <span className="text-sm text-white">Borrar eventos de los dispositivos después de la descarga</span>
                    </label>
                 </div>
              </section>

              {/* Formato de Fecha y Hora */}
              <section className="rounded-xl border border-[#324d67] bg-[#111a22] p-6">
                 <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">Formato de Fecha y Hora</h3>
                 <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                       <label className="text-sm font-medium text-slate-300">Formato de Fecha</label>
                       <select className="h-10 rounded-lg border border-[#324d67] bg-[#233648] px-3 text-sm text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                          <option>dd/MM/yyyy</option>
                          <option>MM/dd/yyyy</option>
                          <option>yyyy/MM/dd</option>
                       </select>
                    </div>
                    <div className="flex flex-col gap-2">
                       <label className="text-sm font-medium text-slate-300">Formato de Hora</label>
                       <select className="h-10 rounded-lg border border-[#324d67] bg-[#233648] px-3 text-sm text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                          <option>HH:mm (24h)</option>
                          <option>hh:mm tt (12h)</option>
                       </select>
                    </div>
                 </div>
              </section>

              <div className="flex justify-end pt-4">
                 <button onClick={handleSave} disabled={saving} className="flex items-center justify-center gap-2 rounded-lg bg-[#53a653] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#468f46] shadow-lg shadow-green-900/20 disabled:opacity-50">
                    <span className="material-symbols-outlined text-[20px]">{saving ? 'sync' : 'save'}</span>
                    {saving ? 'Guardando...' : 'Guardar'}
                 </button>
              </div>

            </div>
          )}

          {/* TAB: BASE DE DATOS */}
          {activeTab === 'db' && (
              <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                  <section className="rounded-xl border border-[#324d67] bg-[#111a22] p-6">
                      <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                          <span className="material-symbols-outlined">database</span>
                          Estado de Base de Datos SQLite
                      </h3>
                      
                      {loadingDb ? (
                          <div className="py-8 flex justify-center"><span className="material-symbols-outlined animate-spin text-3xl text-primary">sync</span></div>
                      ) : dbStatus ? (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                              <div className="p-4 rounded-lg bg-[#192633] border border-slate-700">
                                  <span className="text-xs text-slate-400 uppercase">Estado Archivo</span>
                                  <div className="flex items-center gap-2 mt-1">
                                      <div className={`w-3 h-3 rounded-full ${dbStatus.exists ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                      <span className="text-lg font-bold text-white">{dbStatus.exists ? 'Existe' : 'No Encontrado'}</span>
                                  </div>
                              </div>
                              <div className="p-4 rounded-lg bg-[#192633] border border-slate-700">
                                  <span className="text-xs text-slate-400 uppercase">Tablas Activas</span>
                                  <div className="text-lg font-bold text-white mt-1">{dbStatus.tables} <span className="text-sm font-normal text-slate-500">tablas</span></div>
                              </div>
                              <div className="p-4 rounded-lg bg-[#192633] border border-slate-700">
                                  <span className="text-xs text-slate-400 uppercase">Tamaño en Disco</span>
                                  <div className="text-lg font-bold text-white mt-1">{(dbStatus.size / 1024).toFixed(2)} <span className="text-sm font-normal text-slate-500">KB</span></div>
                              </div>
                              {dbStatus.exists && (
                                  <div className="md:col-span-3 p-3 bg-black/20 rounded text-xs text-slate-500 font-mono break-all">
                                      Ruta: {dbStatus.path}
                                  </div>
                              )}
                          </div>
                      ) : (
                          <p className="text-red-400">Error obteniendo estado.</p>
                      )}

                      <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-700">
                          <button 
                             onClick={handleCreateDb}
                             disabled={loadingDb || (dbStatus && dbStatus.exists && dbStatus.tables > 0)}
                             className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                              <span className="material-symbols-outlined">add_circle</span>
                              Crear / Inicializar
                          </button>

                          <button 
                             onClick={handleBackupDb}
                             disabled={!dbStatus?.exists}
                             className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#233648] text-white font-medium hover:bg-[#344a60] disabled:opacity-50"
                          >
                              <span className="material-symbols-outlined">backup</span>
                              Crear Respaldo
                          </button>

                          <button 
                             onClick={handleOptimizeDb}
                             disabled={!dbStatus?.exists}
                             className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#233648] text-white font-medium hover:bg-[#344a60] disabled:opacity-50"
                          >
                              <span className="material-symbols-outlined">build</span>
                              Optimizar (Vacuum)
                          </button>
                      </div>
                      
                      <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-200">
                          <p><strong>Nota:</strong> Si la base de datos ya existe, el botón "Crear" está deshabilitado para evitar sobrescritura accidental. Use "Optimizar" para mantenimiento regular.</p>
                      </div>
                  </section>
              </div>
          )}

          {/* TAB: TRANSFERENCIA */}
          {activeTab === 'transfer' && (
             <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                <section className="rounded-xl border border-[#324d67] bg-[#111a22] p-6">
                   <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">Configuración de Conexión de Terminales</h3>
                   <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="flex flex-col gap-2">
                         <label className="text-sm font-medium text-slate-300">Puerto por Defecto (UDP/TCP)</label>
                         <input 
                            type="number" 
                            className="h-10 rounded-lg border border-[#324d67] bg-[#233648] px-3 text-sm text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            value={settings.communication.defaultPort}
                            onChange={(e) => updateSetting('communication', 'defaultPort', parseInt(e.target.value))}
                         />
                      </div>
                      <div className="flex flex-col gap-2">
                         <label className="text-sm font-medium text-slate-300">IP del Servidor (Local)</label>
                         <input 
                            type="text" 
                            className="h-10 rounded-lg border border-[#324d67] bg-[#233648] px-3 text-sm text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            value={settings.communication.serverIp}
                            onChange={(e) => updateSetting('communication', 'serverIp', e.target.value)}
                         />
                      </div>
                   </div>
                   <div className="flex justify-end pt-4">
                        <button onClick={handleSave} disabled={saving} className="flex items-center justify-center gap-2 rounded-lg bg-[#53a653] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#468f46] shadow-lg shadow-green-900/20 disabled:opacity-50">
                            <span className="material-symbols-outlined text-[20px]">{saving ? 'sync' : 'save'}</span>
                            {saving ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </section>
             </div>
          )}

          {/* TAB: API (Mantenido) */}
          {activeTab === 'api' && (
             <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                <section className="rounded-xl border border-[#324d67] bg-[#111a22] p-6">
                   <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">Conexión Backend</h3>
                   <div className="flex flex-col gap-6">
                       <div className="flex items-center justify-between rounded-lg bg-[#233648] p-4">
                           <div className="flex flex-col">
                               <span className="text-white font-medium">Usar Mock API</span>
                               <span className="text-sm text-slate-400">Si activo, no conecta al servidor real.</span>
                           </div>
                           <label className="relative inline-flex cursor-pointer items-center">
                              <input 
                                type="checkbox" 
                                className="peer sr-only" 
                                checked={settings.communication.useMockApi}
                                onChange={(e) => updateSetting('communication', 'useMockApi', e.target.checked)}
                              />
                              <div className="peer h-6 w-11 rounded-full bg-slate-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50"></div>
                           </label>
                       </div>
                       <div className={`flex flex-col gap-2 ${settings.communication.useMockApi ? 'opacity-50' : ''}`}>
                           <label className="text-sm font-medium text-slate-300">URL del Backend API</label>
                           <input 
                              type="text" 
                              className="h-10 rounded-lg border border-[#324d67] bg-[#233648] px-3 text-sm text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                              value={settings.communication.apiUrl}
                              onChange={(e) => updateSetting('communication', 'apiUrl', e.target.value)}
                           />
                       </div>
                   </div>
                   <div className="flex justify-end pt-4">
                        <button onClick={handleSave} disabled={saving} className="flex items-center justify-center gap-2 rounded-lg bg-[#53a653] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#468f46] shadow-lg shadow-green-900/20 disabled:opacity-50">
                            <span className="material-symbols-outlined text-[20px]">{saving ? 'sync' : 'save'}</span>
                            {saving ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </section>
             </div>
          )}

           {/* Placeholder for tasks */}
           {activeTab === 'tasks' && (
               <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-[#324d67] bg-[#111a22] text-slate-400">
                   <span className="material-symbols-outlined text-4xl mb-2">construction</span>
                   <p>Esta sección está en desarrollo.</p>
               </div>
           )}

        </div>
      </div>
    </div>
  );
};

export default Settings;