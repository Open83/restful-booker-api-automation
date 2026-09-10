import { APIClient } from './api-client';
import { AuthResponse } from '../models/booking.types';
import { APIRequestContext } from '@playwright/test';

export class AuthClient extends APIClient {
  constructor(request: APIRequestContext, baseURL: string) {
    super(request, baseURL);
  }

  async createToken(username: string, password: string): Promise<string> {
    const response = await this.post<AuthResponse>('/auth', {
      username,
      password,
    });
    return response.token;
  }

  async createTokenResponse(username: string, password: string) {
    return this.postResponse('/auth', {
      username,
      password,
    });
  }
}
