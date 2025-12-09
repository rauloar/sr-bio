import { Device, User, SystemSettings, DeviceDiagnostics, EventLog } from '../types';

// --- CONFIGURATION ---
const STORAGE_KEY_SETTINGS = 'sr_bio_settings';

// Default to real API usage
const DEFAULT_SETTINGS: SystemSettings = {
  communication: { 
    defaultPort: 4370, 
    connectionTimeout: 15, 
    retryCount: 2, 
    serverIp: '127.0.0.1', 
    serverPort: 3000,
    apiUrl: 'http://localhost:3000/api',
    useMockApi: false 
  }
};

const loadSettings = (): SystemSettings => {
  const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
  if (saved) {
    try {
      return JSON.parse(saved);
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

export const AuthService = {
  login: async (username: string, password: string): Promise<{ success: boolean; token?: string; user?: any; message?: string }> => {
    try {
        const res = await fetch(`${getApiUrl()}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        
        if (data.success) {
            localStorage.setItem('sr_bio_token', data.token);
            localStorage.setItem('sr_bio_user', JSON.stringify(data.user));
        }
        return data;

    } catch (e) {
        console.error("Auth error", e);
        return { success: false, message: "Error de conexión con el servidor" };
    }
  },

  logout: () => {
    localStorage.removeItem('sr_bio_token');
    localStorage.removeItem('sr_bio_user');
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('sr_bio_token');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('sr_bio_user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

export const DeviceService = {
  getAll: async (): Promise<Device[]> => {
    try {
      const res = await fetch(`${getApiUrl()}/devices`);
      if (!res.ok) throw new Error('Failed to fetch from backend');
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn("Backend connection failed", err);
      return [];
    }
  },

  update: async (id: string, data: Partial<Device>): Promise<boolean> => {
      try {
        const res = await fetch(`${getApiUrl()}/devices/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.ok;
      } catch (err) { return false; }
  },

  getDeviceInfo: async (deviceId: string): Promise<DeviceDiagnostics> => {
      try {
        const res = await fetch(`${getApiUrl()}/devices/${deviceId}/info`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const json = await res.json().catch(() => ({}));

        if (!res.ok || !json.success) {
           return { 
               success: false, 
               message: json.message || `Error del servidor (Código ${res.status})`,
               data: undefined
           };
        }
        
        return {
            success: true,
            message: "Datos obtenidos",
            data: json.data
        };
      } catch (err: any) {
        return { 
          success: false, 
          message: "No se pudo conectar con el servidor backend.",
        };
      }
  },

  sync: async (deviceId: string): Promise<boolean> => {
      try {
        const res = await fetch(`${getApiUrl()}/devices/${deviceId}/sync`, { method: 'POST' });
        return res.ok;
      } catch (err) { return false; }
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
            // Extended fields
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
                userName: log.userName,       // Nuevo del backend
                userLastname: log.userLastname, // Nuevo del backend
                device: log.ip || 'Terminal', 
                details: `Modo verificación: ${log.verifyType || 'FP/Pass'}`
            };
        });
    } catch(e) {
         console.error("Error fetching logs", e);
         return [];
    }
  },
  
  downloadFromTerminals: async (): Promise<{ success: boolean; count: number; message: string }> => {
     try {
         const devices = await DeviceService.getAll();
         if(devices.length === 0) return { success: false, count: 0, message: "No hay dispositivos."};
         
         const syncRes = await fetch(`${getApiUrl()}/devices/${devices[0].id}/sync`, { method: 'POST' });
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