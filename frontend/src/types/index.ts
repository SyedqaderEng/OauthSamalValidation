export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface SamlEntity {
  id: string;
  type: 'SP' | 'IDP';
  entityId: string;
  ssoUrl?: string | null;
  sloUrl?: string | null;
  acsUrls: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SamlLog {
  id: string;
  entityId: string;
  userId?: string | null;
  eventType: string;
  status: string;
  details: any;
  createdAt: string;
  user?: {
    email: string;
    username: string;
  };
}

export interface SamlConfig {
  id: string;
  appRole: 'SP' | 'IDP' | 'BOTH';
  defaultEntityId: string;
  hasSigningCert: boolean;
  hasEncryptionCert: boolean;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface ApiError {
  error: string;
  details?: any;
}
