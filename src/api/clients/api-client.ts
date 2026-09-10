import { APIRequestContext, APIResponse } from '@playwright/test';

type RequestPayload = Record<string, any>;

export class APIClient {
  constructor(
    protected request: APIRequestContext,
    protected baseURL: string,
  ) {}

  async get<T>(endpoint: string, token?: string): Promise<T> {
    const headers = this.getHeaders(token);
    const response = await this.request.get(`${this.baseURL}${endpoint}`, { headers });
    return response.json();
  }

  async post<T>(endpoint: string, payload: RequestPayload, token?: string): Promise<T> {
    const headers = this.getHeaders(token);
    const response = await this.request.post(`${this.baseURL}${endpoint}`, {
      headers,
      data: payload,
    });
    return response.json();
  }

  async put<T>(endpoint: string, payload: RequestPayload, token?: string): Promise<T> {
    const headers = this.getHeaders(token);
    const response = await this.request.put(`${this.baseURL}${endpoint}`, {
      headers,
      data: payload,
    });
    return response.json();
  }

  async patch<T>(endpoint: string, payload: RequestPayload, token?: string): Promise<T> {
    const headers = this.getHeaders(token);
    const response = await this.request.patch(`${this.baseURL}${endpoint}`, {
      headers,
      data: payload,
    });
    return response.json();
  }

  async delete(endpoint: string, token?: string): Promise<Record<string, any> | string> {
    const headers = this.getHeaders(token);
    const response = await this.request.delete(`${this.baseURL}${endpoint}`, { headers });
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  async getResponse(endpoint: string, token?: string): Promise<APIResponse> {
    const headers = this.getHeaders(token);
    return this.request.get(`${this.baseURL}${endpoint}`, { headers });
  }

  async postResponse(endpoint: string, payload: RequestPayload, token?: string): Promise<APIResponse> {
    const headers = this.getHeaders(token);
    return this.request.post(`${this.baseURL}${endpoint}`, {
      headers,
      data: payload,
    });
  }

  async putResponse(endpoint: string, payload: RequestPayload, token?: string): Promise<APIResponse> {
    const headers = this.getHeaders(token);
    return this.request.put(`${this.baseURL}${endpoint}`, {
      headers,
      data: payload,
    });
  }

  async deleteResponse(endpoint: string, token?: string): Promise<APIResponse> {
    const headers = this.getHeaders(token);
    return this.request.delete(`${this.baseURL}${endpoint}`, { headers });
  }

  private getHeaders(token?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Cookie'] = `token=${token}`;
    }
    return headers;
  }
}
