import { ApiClient } from '../clients/ApiClient';
import { UserPayload, ApiResponse, UserDetailResponse } from '../models/User';

export class AccountService {
  constructor(private client: ApiClient) {}

  /**
   * Convierte un UserPayload tipado a un form plano de strings
   * que la API de automationexercise.com espera (x-www-form-urlencoded).
   */
  private toFormData(payload: UserPayload): Record<string, string> {
    return Object.fromEntries(
      Object.entries(payload).map(([key, value]) => [key, String(value)])
    );
  }

  async createUser(payload: UserPayload): Promise<ApiResponse> {
    const form = this.toFormData(payload);
    const response = await this.client.post('/api/createAccount', form);
    return response.json();
  }

  async getUserDetailByEmail(email: string): Promise<UserDetailResponse> {
    const response = await this.client.get('/api/getUserDetailByEmail', { email });
    return response.json();
  }

  async deleteUser(email: string, password: string): Promise<ApiResponse> {
    const response = await this.client.delete('/api/deleteAccount', { email, password });
    return response.json();
  }

  /**
   * API 7: verifica credenciales de login.
   * POST /api/verifyLogin con form { email, password }
   */
  async verifyLogin(email: string, password: string): Promise<ApiResponse> {
    const response = await this.client.post('/api/verifyLogin', { email, password });
    return response.json();
  }
}