
import React, { useState, useEffect } from 'react';
import { SettingsService } from '../services/api';
import { SystemSettings } from '../types';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'basic' | 'transfer' | 'tasks' | 'api'>('basic');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Estado inicial
  const [settings, setSettings] = useState<SystemSettings>({
    communication: { 
        defaultPort: 4370, 
        connectionTimeout: 5, 
        retryCount: 1, 
        serverIp: '', 
        serverPort: 0,
        apiUrl: 'http://localhost:3000/api',
        useMockApi: true
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

  // Helper para actualizar el estado anidado
  const updateSetting = (section: 'communication', key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
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
            { id: 'transfer', label: 'Conexión y Transferencia' },
            { id: 'tasks', label: 'Tareas Programadas' },
            { id: 'api', label: 'API & Backend (Dev)' },
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
                       <input type="checkbox" className="h-5 w-5 rounded border-slate-600 bg-[#233648] text-primary focus:ring-offset-0" />
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

              {/* Funciones Opcionales */}
              <section className="rounded-xl border border-[#324d67] bg-[#111a22] p-6">
                 <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">Funciones Opcionales</h3>
                 <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label className="flex cursor-pointer items-center gap-3">
                       <input type="checkbox" className="h-5 w-5 rounded border-slate-600 bg-[#233648] text-primary focus:ring-offset-0" />
                       <span className="text-sm text-white">Activar Control de Acceso</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-3">
                       <input type="checkbox" className="h-5 w-5 rounded border-slate-600 bg-[#233648] text-primary focus:ring-offset-0" />
                       <span className="text-sm text-white">Activar Reporte de Email Push</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-3">
                       <input type="checkbox" className="h-5 w-5 rounded border-slate-600 bg-[#233648] text-primary focus:ring-offset-0" />
                       <span className="text-sm text-white">Activar SMS</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-3">
                       <input type="checkbox" className="h-5 w-5 rounded border-slate-600 bg-[#233648] text-primary focus:ring-offset-0" />
                       <span className="text-sm text-white">Activar Gestión de Memoria USB</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-3">
                       <input type="checkbox" className="h-5 w-5 rounded border-slate-600 bg-[#233648] text-primary focus:ring-offset-0" />
                       <span className="text-sm text-white">Activar Código de Trabajo</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-3">
                       <input type="checkbox" className="h-5 w-5 rounded border-slate-600 bg-[#233648] text-primary focus:ring-offset-0" />
                       <span className="text-sm text-white">Activar Descarga de Foto de Asistencia</span>
                    </label>
                 </div>
              </section>

              {/* Tipo de Calendario */}
              <section className="rounded-xl border border-[#324d67] bg-[#111a22] p-6">
                 <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">Tipo de Calendario</h3>
                 <div className="flex flex-wrap gap-6">
                    <label className="flex cursor-pointer items-center gap-3">
                       <input type="radio" name="calendar" defaultChecked className="h-5 w-5 border-slate-600 bg-[#233648] text-primary focus:ring-offset-0" />
                       <span className="text-sm text-white">Normal</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-3">
                       <input type="radio" name="calendar" className="h-5 w-5 border-slate-600 bg-[#233648] text-primary focus:ring-offset-0" />
                       <span className="text-sm text-white">Irán</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-3">
                       <input type="radio" name="calendar" className="h-5 w-5 border-slate-600 bg-[#233648] text-primary focus:ring-offset-0" />
                       <span className="text-sm text-white">Árabe</span>
                    </label>
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

          {/* TAB: TRANSFERENCIA DE DATOS (Conexión ZKTeco) */}
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
                         <p className="text-xs text-slate-500">El puerto estándar para dispositivos ZKTeco es 4370.</p>
                      </div>
                      <div className="flex flex-col gap-2">
                         <label className="text-sm font-medium text-slate-300">Tiempo de Espera (Timeout Segundos)</label>
                         <input 
                            type="number" 
                            className="h-10 rounded-lg border border-[#324d67] bg-[#233648] px-3 text-sm text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            value={settings.communication.connectionTimeout}
                            onChange={(e) => updateSetting('communication', 'connectionTimeout', parseInt(e.target.value))}
                         />
                      </div>
                      <div className="flex flex-col gap-2">
                         <label className="text-sm font-medium text-slate-300">Intentos de Reconexión</label>
                         <input 
                            type="number" 
                            className="h-10 rounded-lg border border-[#324d67] bg-[#233648] px-3 text-sm text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            value={settings.communication.retryCount}
                            onChange={(e) => updateSetting('communication', 'retryCount', parseInt(e.target.value))}
                         />
                      </div>
                   </div>
                </section>

                <section className="rounded-xl border border-[#324d67] bg-[#111a22] p-6">
                   <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">Configuración ADMS (Push SDK)</h3>
                   <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="flex flex-col gap-2">
                         <label className="text-sm font-medium text-slate-300">IP del Servidor (Local)</label>
                         <input 
                            type="text" 
                            className="h-10 rounded-lg border border-[#324d67] bg-[#233648] px-3 text-sm text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            value={settings.communication.serverIp}
                            onChange={(e) => updateSetting('communication', 'serverIp', e.target.value)}
                         />
                         <p className="text-xs text-slate-500">Dirección IP de este servidor donde los terminales enviarán los datos.</p>
                      </div>
                      <div className="flex flex-col gap-2">
                         <label className="text-sm font-medium text-slate-300">Puerto del Servidor</label>
                         <input 
                            type="number" 
                            className="h-10 rounded-lg border border-[#324d67] bg-[#233648] px-3 text-sm text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            value={settings.communication.serverPort}
                            onChange={(e) => updateSetting('communication', 'serverPort', parseInt(e.target.value))}
                         />
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

          {/* TAB: API & BACKEND (DEV) */}
          {activeTab === 'api' && (
             <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                <div className="rounded-xl border border-yellow-600/50 bg-yellow-500/10 p-4 text-yellow-200">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-3xl">developer_mode</span>
                        <div className="flex flex-col">
                            <span className="font-bold text-lg">Modo Desarrollador</span>
                            <p className="text-sm text-yellow-200/80">
                                Esta sección permite conectar el Frontend con un servidor Backend real (Node.js/Python) que tenga acceso a la red local de los dispositivos.
                            </p>
                        </div>
                    </div>
                </div>

                <section className="rounded-xl border border-[#324d67] bg-[#111a22] p-6">
                   <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">Conexión con Servidor Puente</h3>
                   
                   <div className="flex flex-col gap-6">
                       <div className="flex items-center justify-between rounded-lg bg-[#233648] p-4">
                           <div className="flex flex-col">
                               <span className="text-white font-medium">Usar Mock API (Datos Simulados)</span>
                               <span className="text-sm text-slate-400">Si está activo, no se realizarán llamadas de red reales.</span>
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

                       <div className={`flex flex-col gap-2 transition-opacity ${settings.communication.useMockApi ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                           <label className="text-sm font-medium text-slate-300">URL del Backend API</label>
                           <div className="flex gap-2">
                               <input 
                                  type="text" 
                                  placeholder="http://localhost:3000/api"
                                  className="h-10 flex-1 rounded-lg border border-[#324d67] bg-[#233648] px-3 text-sm text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                  value={settings.communication.apiUrl}
                                  onChange={(e) => updateSetting('communication', 'apiUrl', e.target.value)}
                               />
                               <button className="flex items-center gap-2 rounded-lg bg-[#233648] px-4 py-2 text-sm font-medium text-white hover:bg-[#344a60]">
                                   <span className="material-symbols-outlined text-sm">wifi_tethering</span>
                                   Test Ping
                               </button>
                           </div>
                           <p className="text-xs text-slate-500">
                               El backend debe implementar endpoints como <code className="bg-slate-800 px-1 rounded text-slate-300">POST /devices/:id/test-connection</code> que utilicen librerías como <span className="text-primary">node-zklib</span>.
                           </p>
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

           {/* Placeholder for other tabs */}
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
