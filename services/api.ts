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
    // Auth sigue siendo simulado porque no tenemos DB de usuarios web
    return new Promise((resolve) => {
      setTimeout(() => {
        if (username === 'admin' && password === 'password') {
          const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.real';
          const user = { name: 'Administrador', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBi2BiXGn43U3J2AFbqw90t5qoo1lHUOCNW3o7T7kCZTc7gPkt4-1DA_y2D4_hOdl_PojC89G2FD-2AYcArIp0-T0T_kJlgFQejqC5T1IuC5HYV9xVfGPe5KK3n_0liSq6dWcF-jMQyi4_pIfHqFPmq0N-1XXm58Ac6SQFQjJTqi_RCsFkSezSfJFW81wMsfwQuJlOv6FGacn4-soEoLtv_C-0VwAem5MRC9ENAFWeLkCLvz6hlmtsYcmiv5Wjjg1SyWaBQxmny9h0' };
          localStorage.setItem('sr_bio_token', fakeToken);
          localStorage.setItem('sr_bio_user', JSON.stringify(user));
          resolve({ success: true, token: fakeToken, user });
        } else {
          resolve({ success: false, message: 'Credenciales inválidas (admin/password)' });
        }
      }, 500);
    });
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
  // Ahora requiere un deviceId porque los usuarios viven en el terminal
  getAllFromDevice: async (deviceId: string): Promise<User[]> => {
    try {
        const res = await fetch(`${getApiUrl()}/devices/${deviceId}/users`);
        const json = await res.json();
        
        if (!json.success || !json.data) return [];

        // Mapear datos crudos de ZKLib a nuestra interfaz User
        return json.data.map((zkUser: any) => ({
            id: zkUser.userId || zkUser.uid,
            name: zkUser.name || `User ${zkUser.userId}`,
            email: '-', // ZK standard no suele guardar email
            department: 'General',
            status: 'Active',
            avatar: '', 
            biometrics: { fingerprint: false, face: false }, // Info no disponible en llamada simple
            role: zkUser.role === 14 ? 'Admin' : 'User'
        }));
    } catch (e) {
        console.error("Error fetching users", e);
        return [];
    }
  }
};

export const LogService = {
  getLogsFromDevice: async (deviceId: string): Promise<EventLog[]> => {
    try {
        const res = await fetch(`${getApiUrl()}/devices/${deviceId}/logs`);
        const json = await res.json();
        
        if (!json.success || !json.data) return [];

        // Mapear logs crudos de ZKLib a EventLog
        return json.data.map((log: any, index: number) => ({
            id: `log-${index}`,
            timestamp: new Date(log.recordTime).toLocaleString(),
            type: 'Success', // Asumimos éxito si hay log
            eventName: 'Fichaje Asistencia',
            user: log.deviceUserId,
            device: log.ip || 'Terminal', // ZKLib a veces no devuelve IP en el objeto log
            details: `Modo verificación: ${log.verifyType || 'FP/Pass'}`
        }));
    } catch(e) {
         console.error("Error fetching logs", e);
         return [];
    }
  },
  
  downloadFromTerminals: async (): Promise<{ success: boolean; count: number; message: string }> => {
     // Implementación simplificada: intenta descargar del primer dispositivo
     try {
         const devices = await DeviceService.getAll();
         if(devices.length === 0) return { success: false, count: 0, message: "No hay dispositivos."};
         
         const logs = await LogService.getLogsFromDevice(devices[0].id);
         return { success: true, count: logs.length, message: `Se encontraron ${logs.length} registros en ${devices[0].name}` };
     } catch(e) {
         return { success: false, count: 0, message: "Error en descarga masiva." };
     }
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