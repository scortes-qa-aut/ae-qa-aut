import { APIRequestContext, APIResponse } from '@playwright/test';
import * as allure from 'allure-js-commons';

const SENSITIVE_FIELDS = ['password', 'token', 'api_key', 'authorization'];

export class ApiClient {
  constructor(private request: APIRequestContext) {}

  private maskSensitive(data: Record<string, unknown>): Record<string, unknown> {
    const masked = { ...data };
    for (const key of Object.keys(masked)) {
      if (SENSITIVE_FIELDS.includes(key.toLowerCase())) {
        masked[key] = '***';
      }
    }
    return masked;
  }

  private async attachExchange(
    method: string,
    path: string,
    requestData: Record<string, unknown> | undefined,
    response: APIResponse
  ): Promise<void> {
    if (requestData) {
      await allure.attachment(
        `${method} ${path} - Request`,
        JSON.stringify(this.maskSensitive(requestData), null, 2),
        { contentType: 'application/json' }
      );
    }

    const body = await response.text();
    await allure.attachment(
      `${method} ${path} - Response (${response.status()})`,
      body,
      { contentType: 'application/json' }
    );
  }

  async post(path: string, formData: Record<string, string>): Promise<APIResponse> {
    const response = await this.request.post(path, { form: formData });
    await this.attachExchange('POST', path, formData, response);
    return response;
  }

  async get(path: string, params?: Record<string, string>): Promise<APIResponse> {
    const response = await this.request.get(path, { params });
    await this.attachExchange('GET', path, params, response);
    return response;
  }

  async delete(path: string, params?: Record<string, string>): Promise<APIResponse> {
    const response = await this.request.delete(path, { params });
    await this.attachExchange('DELETE', path, params, response);
    return response;
  }
}