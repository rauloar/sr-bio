
export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  status: 'Active' | 'Inactive';
  avatar: string;
  biometrics: {
    fingerprint: boolean;
    face: boolean;
  };
  // Metadatos del backend (ya no objetos de librería crudos)
  externalId?: string; 
  internalUid?: string;
  role?: 'User' | 'Admin';
}

export interface Device {
  id: string;
  name: string;
  ip: string;
  model: string;
  firmware: string;
  status: 'Online' | 'Offline' | 'Syncing'; // Represents last known status or current operation status
  lastSeen: string;
  mac: string;
  gateway: string;
  subnet: string;
  image: string;
  port: number;
}

export interface ZkCapacity {
  userCount: number;
  userCapacity: number;
  logCount: number;
  logCapacity: number;
  fingerprintCount: number;
  fingerprintCapacity: number;
  faceCount: number;
  faceCapacity: number;
}

export interface DeviceDiagnostics {
  success: boolean;
  message: string;
  data?: {
    deviceTime: string; // Fecha y hora interna del reloj del dispositivo
    firmwareVersion: string;
    serialNumber: string;
    platform: string; // e.g., ZLM60
    capacity: ZkCapacity;
  }
}

export interface EventLog {
  id: string;
  timestamp: string;
  type: 'Success' | 'Error' | 'Info' | 'Warning';
  eventName: string;
  user: string;
  device: string;
  details: string;
}

export interface SystemSettings {
  communication: {
    defaultPort: number;
    connectionTimeout: number;
    retryCount: number;
    serverIp: string;
    serverPort: number;
    // Real Backend Configuration
    apiUrl: string;
    useMockApi: boolean;
  };
}