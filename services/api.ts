import { Device, User, SystemSettings, DeviceDiagnostics } from '../types';

// --- CONFIGURATION ---
const STORAGE_KEY_SETTINGS = 'sr_bio_settings';

// Default configuration sets useMockApi to FALSE to try real connection immediately
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

// --- MOCK DATA FALLBACKS (Solo usados si falla el backend y se activa el modo mock manualmente) ---
const TERMINAL_IMG = "https://cdn-icons-png.flaticon.com/512/9638/9638162.png";
const MOCK_DEVICES: Device[] = [
  { id: 'mock-1', name: 'Mock Device', ip: '0.0.0.0', port: 4370, model: 'Virtual', firmware: 'v1', status: 'Offline', lastSeen: '-', mac: '', gateway: '', subnet: '', image: TERMINAL_IMG },
];

const MOCK_USERS: User[] = [
    { id: '1001', name: 'Usuario Demo', email: 'demo@example.com', department: 'IT', status: 'Active', avatar: '', biometrics: { fingerprint: true, face: false }, role: 'User' },
];

// --- SERVICES ---

export const AuthService = {
  login: async (username: string, password: string): Promise<{ success: boolean; token?: string; user?: any; message?: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (username === 'admin' && password === 'password') {
          const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock';
          const user = { name: 'Administrador', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBi2BiXGn43U3J2AFbqw90t5qoo1lHUOCNW3o7T7kCZTc7gPkt4-1DA_y2D4_hOdl_PojC89G2FD-2AYcArIp0-T0T_kJlgFQejqC5T1IuC5HYV9xVfGPe5KK3n_0liSq6dWcF-jMQyi4_pIfHqFPmq0N-1XXm58Ac6SQFQjJTqi_RCsFkSezSfJFW81wMsfwQuJlOv6FGacn4-soEoLtv_C-0VwAem5MRC9ENAFWeLkCLvz6hlmtsYcmiv5Wjjg1SyWaBQxmny9h0' };
          localStorage.setItem('sr_bio_token', fakeToken);
          localStorage.setItem('sr_bio_user', JSON.stringify(user));
          resolve({ success: true, token: fakeToken, user });
        } else {
          resolve({ success: false, message: 'Credenciales inválidas' });
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
    // Intentar conectar con el backend real por defecto
    if (!CURRENT_SETTINGS.communication.useMockApi) {
      try {
        const res = await fetch(`${getApiUrl()}/devices`);
        if (!res.ok) throw new Error('Failed to fetch from backend');
        return await res.json();
      } catch (err) {
        console.warn("No se pudo conectar con el Backend en localhost:3000. Asegúrate de correr 'npm run server'.", err);
        // Si falla la conexión, devolvemos array vacío para que el usuario vea que algo pasa, 
        // o podríamos devolver mock si quisiéramos ser más permisivos.
        // Devolvemos vacío con un item de error visual
        return [{
            id: 'error', 
            name: 'Error de Conexión Backend', 
            ip: 'localhost:3000', 
            port: 0, 
            model: 'Server Down', 
            firmware: '-', 
            status: 'Offline', 
            lastSeen: '-', 
            mac: '', 
            gateway: '', 
            subnet: '', 
            image: TERMINAL_IMG 
        }];
      }
    }
    return MOCK_DEVICES;
  },

  getDeviceInfo: async (deviceId: string): Promise<DeviceDiagnostics> => {
    if (!CURRENT_SETTINGS.communication.useMockApi) {
      try {
        const res = await fetch(`${getApiUrl()}/devices/${deviceId}/info`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!res.ok) {
           // Intentar leer el mensaje de error JSON del servidor
           try {
             const errJson = await res.json();
             return { success: false, message: errJson.message || 'Error del servidor' };
           } catch(e) {
             return { success: false, message: `Error HTTP: ${res.status}` };
           }
        }
        
        return await res.json();
      } catch (err: any) {
        return { 
          success: false, 
          message: `Error de red: No se pudo contactar con el backend. Asegúrate de que 'npm run server' esté corriendo.` 
        };
      }
    }
    
    // Fallback Mock
    return { success: false, message: "Modo Mock activo. Desactívalo en configuración." };
  },

  sync: async (deviceId: string): Promise<boolean> => {
    if (!CURRENT_SETTINGS.communication.useMockApi) {
      try {
        const res = await fetch(`${getApiUrl()}/devices/${deviceId}/sync`, { method: 'POST' });
        return res.ok;
      } catch (err) { return false; }
    }
    return true;
  }
};

export const UserService = {
  getAll: async (): Promise<User[]> => {
    return MOCK_USERS;
  }
};

export const LogService = {
  downloadFromTerminals: async (): Promise<{ success: boolean; count: number; message: string; data?: any[] }> => {
    if (!CURRENT_SETTINGS.communication.useMockApi) {
         try {
            const res = await fetch(`${getApiUrl()}/logs/download`, { method: 'POST' });
            if(!res.ok) throw new Error("Backend error");
            return await res.json();
         } catch(e) {
             return { success: false, count: 0, message: "Error conectando al backend." };
         }
    }
    return { success: true, count: 0, message: "Mock download." };
  }
};

export const SettingsService = {
  get: async (): Promise<SystemSettings> => {
    // Recargamos config de localStorage por si hubo cambios externos
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