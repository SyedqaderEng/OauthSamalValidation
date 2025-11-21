import axios, { AxiosInstance } from 'axios';
import { User, SamlEntity, SamlLog, SamlConfig, AuthResponse } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests if available
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle 401 errors (token expired)
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // ========== Auth ==========
  async signup(data: {
    email: string;
    username: string;
    password: string;
    displayName?: string;
  }): Promise<AuthResponse> {
    const response = await this.api.post('/api/auth/signup', data);
    return response.data;
  }

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const response = await this.api.post('/api/auth/login', data);
    return response.data;
  }

  async getCurrentUser(): Promise<{ user: User }> {
    const response = await this.api.get('/api/auth/me');
    return response.data;
  }

  async getUserSamlLogs(): Promise<{ logs: SamlLog[] }> {
    const response = await this.api.get('/api/auth/saml-logs');
    return response.data;
  }

  // ========== Metadata ==========
  async importMetadata(xml: string): Promise<{ entity: SamlEntity }> {
    const response = await this.api.post('/api/metadata/import', { xml });
    return response.data;
  }

  async listMetadata(): Promise<{ entities: SamlEntity[] }> {
    const response = await this.api.get('/api/metadata/list');
    return response.data;
  }

  async getMetadata(entityId: string): Promise<{ entity: SamlEntity }> {
    const response = await this.api.get(
      `/api/metadata/${encodeURIComponent(entityId)}`
    );
    return response.data;
  }

  async deleteMetadata(entityId: string): Promise<{ message: string }> {
    const response = await this.api.delete(
      `/api/metadata/${encodeURIComponent(entityId)}`
    );
    return response.data;
  }

  getSpMetadataUrl(): string {
    return `${API_URL}/api/metadata/export/sp`;
  }

  getIdpMetadataUrl(): string {
    return `${API_URL}/api/metadata/export/idp`;
  }

  // ========== SAML Config ==========
  async getSamlConfig(): Promise<{ config: SamlConfig }> {
    const response = await this.api.get('/api/saml-config');
    return response.data;
  }

  async updateSamlConfig(data: {
    appRole: 'SP' | 'IDP' | 'BOTH';
    defaultEntityId?: string;
  }): Promise<{ config: SamlConfig }> {
    const response = await this.api.put('/api/saml-config', data);
    return response.data;
  }

  // ========== SAML ==========
  getSamlLoginUrl(idpEntityId: string): string {
    return `${API_URL}/saml/login/${encodeURIComponent(idpEntityId)}`;
  }

  async getSamlLogs(limit: number = 50): Promise<{ logs: SamlLog[] }> {
    const response = await this.api.get(`/saml/logs?limit=${limit}`);
    return response.data;
  }

  async processSamlIdpLogin(spEntityId: string): Promise<{
    samlResponse: string;
    acsUrl: string;
  }> {
    const response = await this.api.post('/saml/idp/sso/process', {
      spEntityId,
    });
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
