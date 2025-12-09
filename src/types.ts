
export interface User {
  id: string; // ID en el terminal ZK
  name: string; // Nombre en ZK
  
  // Datos extendidos (user_details)
  lastname?: string;
  address?: string;
  city?: string;
  province?: string;
  cuit?: string; // ARCA ID
  phone?: string;
  email?: string;

  // Metadatos y sistema
  status: 'Active' | 'Inactive';
  avatar: string;
  biometrics: {
    fingerprint: boolean;
    face: boolean;
  };
  externalId?: string; 
  internalUid?: string; // ID Local SQLite (PK)
  role?: 'User' | 'Admin';
}

export interface Device {
  id: string;
  name: string;
  ip: string;
  model: string;
  firmware: string;
  status: 'Online' | 'Offline' | 'Syncing'; 
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
    deviceTime: string; 
    firmwareVersion: string;
    serialNumber: string;
    platform: string; 
    capacity: ZkCapacity;
  }
}

export interface EventLog {
  id: string;
  timestamp: string;
  type: 'Success' | 'Error' | 'Info' | 'Warning';
  eventName: string;
  user: string;
  userName?: string; 
  userLastname?: string; 
  device: string;
  details: string;
  attendanceStatus: number; // 0=In, 1=Out, 2=BreakOut, 3=BreakIn, 4=OT-In, 5=OT-Out
  verificationMethod: number; // 1=Finger, 15=Face, 0=Pwd/Other, 2=Card
}

export interface SystemSettings {
  communication: {
    defaultPort: number;
    connectionTimeout: number;
    retryCount: number;
    serverIp: string;
    serverPort: number;
    apiUrl: string;
    useMockApi: boolean;
  };
  data: {
      clearLogsAfterDownload: boolean;
  }
}