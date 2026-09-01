export interface User {
  id: string;
  username: string;
  email: string;
  role: 'MASTER_ADMIN' | 'ADMIN' | 'OPERATOR';
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  code: string;
  url: string;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  qrStatus: 'ACTIVE' | 'INACTIVE';
  sessionId?: string;
  isOnline: boolean;
  lastActive?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientSession {
  id: string;
  clientId: string;
  createdAt: string;
  lastActivity: string;
  expiresAt: string;
  status: 'ACTIVE' | 'EXPIRED';
}

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  username: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface DashboardStats {
  totalClients: number;
  activeClients: number;
  inactiveClients: number;
  onlineClients: number;
  offlineClients: number;
  totalQR: number;
  recentClients: Client[];
  recentActivities: AuditLog[];
}

export interface Settings {
  websiteName: string;
  logo?: string;
  favicon?: string;
  description?: string;
  clientUrlPrefix: string;
  sessionExpiration: number;
  defaultClientStatus: 'ACTIVE' | 'INACTIVE';
  qrSettings: {
    size: number;
    bgColor: string;
    fgColor: string;
  };
  apiUrl: string;
  socketUrl: string;
}
