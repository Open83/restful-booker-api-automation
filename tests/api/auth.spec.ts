import { test, expect } from '@playwright/test';
import { AuthClient } from '../../src/api/clients/auth-client';
import { getConfig } from '../../src/api/config';

test.describe('Authentication', () => {
  let authClient: AuthClient;
  let config: ReturnType<typeof getConfig>;

  test.beforeEach(async ({ request }) => {
    config = getConfig();
    authClient = new AuthClient(request, config.baseURL);
  });

  test('POST /auth with valid credentials should return token', async () => {
    const token = await authClient.createToken(config.auth.username, config.auth.password);

    expect(token).toBeTruthy();
    expect(token).toMatch(/^[a-f0-9]+$/);
    expect(token.length).toBeGreaterThan(0);
  });

  test('POST /auth token should be in valid format', async () => {
    const token = await authClient.createToken('admin', 'password123');

    expect(token).toMatch(/^[a-f0-9]{15,16}$/);
  });

  test('POST /auth with invalid credentials should return 200 but no token', async () => {
    const response = await authClient.createTokenResponse('invalid_user', 'wrong_password');

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('reason');
    expect(body.reason).toMatch(/Unauthorized|Bad credentials/i);
  });

  test('POST /auth with empty username should fail', async () => {
    const response = await authClient.createTokenResponse('', 'password123');

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.reason).toBeDefined();
  });

  test('Multiple auth requests should return tokens', async () => {
    const token1 = await authClient.createToken(config.auth.username, config.auth.password);
    const token2 = await authClient.createToken(config.auth.username, config.auth.password);

    expect(token1).toBeTruthy();
    expect(token2).toBeTruthy();
  });
});
