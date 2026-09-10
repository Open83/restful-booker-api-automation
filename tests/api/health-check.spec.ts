import { test, expect } from '@playwright/test';
import { getConfig } from '../../src/api/config';

test.describe('Health Check', () => {
  test('GET /ping should return healthy status', async ({ request }) => {
    const config = getConfig();
    const response = await request.get(`${config.baseURL}/ping`);

    expect(response.status()).toBe(201);
    const text = await response.text();
    expect(text).toBe('Created');
  });
});
