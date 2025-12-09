
import { Device, User, SystemSettings, DeviceDiagnostics } from '../types';

// --- FRONTEND MOCK CONFIGURATION ---
const TERMINAL_IMG = "https://cdn-icons-png.flaticon.com/512/9638/9638162.png";
const STORAGE_KEY_SETTINGS = 'sr_bio_settings';

// --- MOCK DATA ---

const MOCK_DEVICES: Device[] = [
  { id: '1', name: 'Terminal Entrada Principal', ip: '192.168.1.101', port: 4370, model: 'SpeedFace-V5L', firmware: 'Ver 2.8.1', status: 'Online', lastSeen: '27/10/2023', mac: '00:17:61:10:20:30', gateway: '192.168.1.1', subnet: '255.255.255.0', image: TERMINAL_IMG },
  { id: '2', name: 'Puerta del Almacén', ip: '192.168.1.102', port: 4370, model: 'ProFace X', firmware: 'Ver 1.5.3', status: 'Offline', lastSeen: '25/10/2023', mac: '00:17:61:10:20:31', gateway: '192.168.1.1', subnet: '255.255.255.0', image: TERMINAL_IMG },
  { id: '3', name: 'Acceso Laboratorio', ip: '192.168.1.103', port: 4370, model: 'SpeedFace-V5L', firmware: 'Ver 2.8.1', status: 'Online', lastSeen: 'Hoy 09:00', mac: '00:17:61:10:20:32', gateway: '192.168.1.1', subnet: '255.255.255.0', image: TERMINAL_IMG },
];

const MOCK_USERS: User[] = [
    { id: '1001', name: 'Alex Johnson', email: 'alex@example.com', department: 'Ingeniería', status: 'Active', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlHMEQNIv413vlrFbhx--dzKQiZjhC3mEsbGBfGLRSJNT1hD8vCi96ToOLboCl6mJ62xWQCOghS0wlySo1bD26BWMnM8B92vgqsIqt-SfGMZWR4cp9stbrw5ld0gVkkSAY6OydFbiJlemvU01fv_GrbmLiRlfXkchrGuVFOk-5ibMsVgXkCo_SZ_NxMhxgIrDguqCB3EOz7TXWBkoy_TIwERRWoPE8ys2zYYligFl66svSM-61xD8vQAaL-zN-SyOgWjmxMuY0C7E', biometrics: { fingerprint: true, face: false }, externalId: '1', role: 'User' },
    { id: '1002', name: 'Maria Garcia', email: 'maria@example.com', department: 'HR', status: 'Active', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDK-vVHD2qXrYCHhZQisn8h261EX5sexRR9eBq7qE5tIT7WEBoEzECmfWSQ5LguAKUPj_rJf18_DykslYNp-kC4JZP84tSA2VQGIkI_EP6uxuLejKMWUBd_zY488_STyKy8RGK22twYT8yF48zlT0lTq6Lu3B-gE0_14Kt3wv63RWEbk59qVT5xH-DOcTklB_SkJOOh1kJpKzFBM-NVShJ_FdiJ7noS_Qfxup5QWX4LIi92t9aIZcy_PHn6cIwx1Mu1i5JK0Jv-0zc', biometrics: { fingerprint: true, face: true }, externalId: '2', role: 'Admin' },
];

const DEFAULT_SETTINGS: SystemSettings = {
  communication: { 
    defaultPort: 4370, 
    connectionTimeout: 5, 
    retryCount: 3, 
    serverIp: '192.168.1.200', 
    serverPort: 8081,
    apiUrl: 'http://localhost:3000/api',
    useMockApi: true
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

// --- SERVICES ---

export const AuthService = {
  login: async (username: string, password: string): Promise<{ success: boolean; token?: string; user?: any; message?: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (username === 'admin' && password === 'password') {
          const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock';
          const user = { 
            name: 'Administrador', 
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBi2BiXGn43U3J2AFbqw90t5qoo1lHUOCNW3o7T7kCZTc7gPkt4-1DA_y2D4_hOdl_PojC89G2FD-2AYcArIp0-T0T_kJlgFQejqC5T1IuC5HYV9xVfGPe5KK3n_0liSq6dWcF-jMQyi4_pIfHqFPmq0N-1XXm58Ac6SQFQjJTqi_RCsFkSezSfJFW81wMsfwQuJlOv6FGacn4-soEoLtv_C-0VwAem5MRC9ENAFWeLkCLvz6hlmtsYcmiv5Wjjg1SyWaBQxmny9h0' 
          };
          localStorage.setItem('sr_bio_token', fakeToken);
          localStorage.setItem('sr_bio_user', JSON.stringify(user));
          resolve({ success: true, token: fakeToken, user });
        } else {
          resolve({ success: false, message: 'Credenciales inválidas' });
        }
      }, 800);
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
    // Si no es Mock, asumimos que obtenemos la lista de la BD, no de los dispositivos directamente
    if (!CURRENT_SETTINGS.communication.useMockApi) {
      try {
        const res = await fetch(`${getApiUrl()}/devices`);
        if (!res.ok) throw new Error('Failed to fetch');
        return await res.json();
      } catch (err) {
        console.warn("API Error, falling back to mock:", err);
      }
    }
    await delay(300);
    return MOCK_DEVICES;
  },

  // Flujo ZKLIB: Connect -> Disable -> Cmd -> Enable -> Disconnect
  getDeviceInfo: async (deviceId: string): Promise<DeviceDiagnostics> => {
    
    if (!CURRENT_SETTINGS.communication.useMockApi) {
      try {
        const res = await fetch(`${getApiUrl()}/devices/${deviceId}/info`, { 
            method: 'POST', // POST porque trigger una acción en el dispositivo
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!res.ok) {
           const errorText = await res.text();
           return { success: false, message: `Error Backend: ${errorText}` };
        }
        
        return await res.json();
      } catch (err: any) {
        return { 
          success: false, 
          message: `Error de red: No se pudo contactar con el backend en ${getApiUrl()}.` 
        };
      }
    }

    // MOCK SIMULATION OF ZKLIB PROCESS
    return new Promise((resolve) => {
        // 1. Simular conexión + Disable
        setTimeout(() => {
            const device = MOCK_DEVICES.find(d => d.id === deviceId);
            if (!device || device.status === 'Offline') {
                resolve({
                    success: false,
                    message: "No se pudo conectar: Timeout (UDP) o Dispositivo inalcanzable."
                });
                return;
            }

            // 2. Simular obtención de datos
            const now = new Date();
            const deviceTime = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;

            resolve({
                success: true,
                message: "Datos obtenidos correctamente.",
                data: {
                    deviceTime: deviceTime,
                    firmwareVersion: device.firmware,
                    serialNumber: `ZK${Math.floor(Math.random() * 999999)}`,
                    platform: "ZLM60",
                    capacity: {
                        userCount: 142,
                        userCapacity: 3000,
                        logCount: 15420,
                        logCapacity: 100000,
                        fingerprintCount: 230,
                        fingerprintCapacity: 5000,
                        faceCount: 54,
                        faceCapacity: 500
                    }
                }
            });
        }, 2500); // 2.5 segundos para simular el ciclo completo de conexión
    });
  },

  sync: async (deviceId: string): Promise<boolean> => {
    // Trigger real sync (users/logs)
    if (!CURRENT_SETTINGS.communication.useMockApi) {
      try {
        const res = await fetch(`${getApiUrl()}/devices/${deviceId}/sync`, { method: 'POST' });
        return res.ok;
      } catch (err) {
        return false;
      }
    }
    await delay(1000);
    return true;
  }
};

export const UserService = {
  getAll: async (): Promise<User[]> => {
    await delay(600);
    return MOCK_USERS;
  }
};

export const LogService = {
  // Este proceso en el backend conectaría, descargaría, borraría (si se configura) y desconectaría
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

    await delay(3000); // Simular el tiempo que tarda en conectar y descargar
    return {
        success: true,
        count: 14,
        message: 'Ciclo completado: Conectado -> Descargado 14 registros -> Desconectado.',
        data: []
    };
  }
};

export const SettingsService = {
  get: async (): Promise<SystemSettings> => {
    await delay(300);
    return { ...CURRENT_SETTINGS };
  },
  update: async (newSettings: SystemSettings): Promise<boolean> => {
    CURRENT_SETTINGS = newSettings;
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(CURRENT_SETTINGS));
    await delay(600);
    return true;
  }
};
