import { Device, User, SystemSettings, DeviceDiagnostics, EventLog } from '../types';

// --- CONFIGURATION ---
const STORAGE_KEY_SETTINGS = 'sr_bio_settings';

// Default to real API usage on Python Port
const DEFAULT_SETTINGS: SystemSettings = {
  communication: {
    defaultPort: 4370,
    apiUrl: 'http://localhost:8000/api',
    useMockApi: false
  },
  data: {
    clearLogsAfterDownload: false
  }
};

const loadSettings = (): SystemSettings => {
  const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
  if (saved) {
    try {
      // Merge with default to ensure new keys exist
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {
      console.error("Error parsing settings", e);
    }
  }
  return DEFAULT_SETTINGS;
};

let CURRENT_SETTINGS = loadSettings();

// --- HELPERS ---
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const getApiUrl = () => CURRENT_SETTINGS.communication.apiUrl;
const TERMINAL_IMG = "https://cdn-icons-png.flaticon.com/512/9638/9638162.png";


// --- SERVICES ---

export const DeviceService = {
  /**
   * Obtiene todos los dispositivos del backend
   */
  getAll: async (): Promise<Device[]> => {
    const res = await fetch(`${getApiUrl()}/devices`);
    if (!res.ok) return [];
    return await res.json();
  },
  /**
   * Llama al endpoint /api/ping para verificar si el backend está disponible
   */
  ping: async (): Promise<{ status: string }> => {
    const res = await fetch(`${getApiUrl()}/ping`);
    return await res.json();
  },

  /**
   * Obtiene información de un dispositivo usando el endpoint /api/device/{ip}
   */
  getDeviceInfo: async (ip: string, port: number = 4370): Promise<any> => {
    const res = await fetch(`${getApiUrl()}/device/${ip}?port=${port}`);
    if (!res.ok) throw new Error('No se pudo obtener información del dispositivo');
    return await res.json();
  },

  /**
   * Crea un nuevo dispositivo
   */
  create: async (device: Partial<Device>): Promise<any> => {
    const res = await fetch(`${getApiUrl()}/devices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(device)
    });
    return await res.json();
  },

  /**
   * Actualiza un dispositivo existente
   */
  update: async (id: string, device: Partial<Device>): Promise<boolean> => {
    const res = await fetch(`${getApiUrl()}/devices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(device)
    });
    const json = await res.json();
    return json.success;
  },

  /**
   * Elimina un dispositivo
   */
  delete: async (id: string): Promise<boolean> => {
    const res = await fetch(`${getApiUrl()}/devices/${id}`, {
      method: 'DELETE'
    });
    const json = await res.json();
    return json.success;
  },

  /**
   * Sincroniza información técnica (dummy, implementa si tienes endpoint)
   */
  syncInfoOnly: async (id: string): Promise<boolean> => {
    // Implementa el endpoint real si existe
    // Por ahora, simula éxito
    await delay(500);
    return true;
  }
};

export const UserService = {
  getAllFromDevice: async (deviceId: string): Promise<User[]> => {
    try {
        const res = await fetch(`${getApiUrl()}/devices/${deviceId}/users`);
        const json = await res.json();
        
        if (!json.success || !json.data) return [];

        return json.data.map((u: any) => ({
            id: u.userId,
            internalUid: String(u.uid), 
            name: u.name || `User ${u.userId}`,
            email: u.email || '',
            department: 'General',
            status: 'Active',
            avatar: '', 
            biometrics: { fingerprint: false, face: false }, 
            role: u.role === 14 ? 'Admin' : 'User',
            lastname: u.lastname,
            address: u.address,
            city: u.city,
            province: u.province,
            cuit: u.cuit,
            phone: u.phone
        }));
    } catch (e) {
        console.error("Error fetching users", e);
        return [];
    }
  },

  update: async (internalUid: string, data: Partial<User>): Promise<boolean> => {
      try {
          const res = await fetch(`${getApiUrl()}/users/${internalUid}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
          });
          const json = await res.json();
          return json.success;
      } catch(e) {
          console.error("Error updating user", e);
          return false;
      }
  },

  downloadFromTerminal: async (deviceId: string): Promise<{success: boolean, message: string}> => {
      try {
          const res = await fetch(`${getApiUrl()}/devices/${deviceId}/users/download`, { method: 'POST' });
          return await res.json();
      } catch(e) { return { success: false, message: "Error de conexión" }; }
  },

  uploadToTerminal: async (deviceId: string): Promise<{success: boolean, message: string}> => {
      try {
          // Increase timeout logic handled by browser/fetch default or server config
          const res = await fetch(`${getApiUrl()}/devices/${deviceId}/users/upload`, { method: 'POST' });
          return await res.json();
      } catch(e) { return { success: false, message: "Error de conexión" }; }
  }
};

export const LogService = {
  getLogsFromDevice: async (deviceId: string): Promise<EventLog[]> => {
    try {
        const res = await fetch(`${getApiUrl()}/devices/${deviceId}/logs`);
        const json = await res.json();
        if (!json.success || !json.data) return [];
        return json.data.map((log: any, index: number) => {
            let date = new Date(log.recordTime);
            if (isNaN(date.getTime())) date = new Date();
            return {
                id: `log-${index}`,
                timestamp: date.toISOString(),
                type: 'Success',
                eventName: 'Fichaje Asistencia',
                user: log.deviceUserId,
                userName: log.userName,
                userLastname: log.userLastname,
                device: log.ip || 'Terminal',
                details: `Status: ${log.status}, Verify: ${log.verifyType}`,
                attendanceStatus: log.status,
                verificationMethod: log.verifyType
            };
        });
    } catch(e) {
         console.error("Error fetching logs", e);
         return [];
    }
  },
  
  downloadFromTerminals: async (clearLogs: boolean): Promise<{ success: boolean; count: number; message: string }> => {
     try {
         const devices = await DeviceService.getAll();
         if(devices.length === 0) return { success: false, count: 0, message: "No hay dispositivos."};
         
         // Llamar al endpoint especifico de logs download
         const syncRes = await fetch(`${getApiUrl()}/devices/${devices[0].id}/logs/download`, { 
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ clearLogs }) 
         });
         const syncJson = await syncRes.json();
         
         if (syncJson.success) {
             const logs = await LogService.getLogsFromDevice(devices[0].id);
             return { success: true, count: logs.length, message: syncJson.message };
         } else {
             return { success: false, count: 0, message: syncJson.message };
         }
     } catch(e) {
         return { success: false, count: 0, message: "Error en descarga masiva." };
     }
  }
};

export const DatabaseService = {
    getStatus: async (): Promise<{exists: boolean, size: number, tables: number, path: string, message?: string}> => {
        try {
            const res = await fetch(`${getApiUrl()}/db/status`);
            return await res.json();
        } catch (e) {
            return { exists: false, size: 0, tables: 0, path: '', message: "No se puede conectar al backend" };
        }
    },
    
    init: async (): Promise<{success: boolean, message: string}> => {
        try {
            const res = await fetch(`${getApiUrl()}/db/init`, { method: 'POST' });
            return await res.json();
        } catch (e) { return { success: false, message: "Error en petición" }; }
    },

    backup: async (): Promise<{success: boolean, message: string}> => {
        try {
            const res = await fetch(`${getApiUrl()}/db/backup`, { method: 'POST' });
            return await res.json();
        } catch (e) { return { success: false, message: "Error en petición" }; }
    },

    optimize: async (): Promise<{success: boolean, message: string}> => {
        try {
            const res = await fetch(`${getApiUrl()}/db/optimize`, { method: 'POST' });
            return await res.json();
        } catch (e) { return { success: false, message: "Error en petición" }; }
    }
};


// --- AUTH SERVICE ---
export const AuthService = {
  isAuthenticated: (): boolean => {
    // Simple auth check (replace with real logic as needed)
    return !!localStorage.getItem('sr_bio_token');
  },
  login: async (username: string, password: string): Promise<{ success: boolean; token?: string; message?: string }> => {
    // Replace with real API call
    if (username === 'admin' && password === 'admin') {
      localStorage.setItem('sr_bio_token', 'demo-token');
      return { success: true, token: 'demo-token' };
    }
    return { success: false, message: 'Credenciales inválidas' };
  },
  logout: () => {
    localStorage.removeItem('sr_bio_token');
  }
};

export const SettingsService = {
  get: async (): Promise<SystemSettings> => {
    CURRENT_SETTINGS = loadSettings();
    await delay(100);
    return { ...CURRENT_SETTINGS };
  },
  update: async (newSettings: SystemSettings): Promise<boolean> => {
    CURRENT_SETTINGS = newSettings;
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(CURRENT_SETTINGS));
    await delay(200);
    return true;
  }
};