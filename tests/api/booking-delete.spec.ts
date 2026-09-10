import { test, expect } from '@playwright/test';
import { BookingClient } from '../../src/api/clients/booking-client';
import { AuthClient } from '../../src/api/clients/auth-client';
import { getConfig } from '../../src/api/config';
import { validBooking } from '../../src/api/test-data/booking-data';

const config = getConfig();

test.describe('Delete Booking', () => {
  let bookingClient: BookingClient;
  let authClient: AuthClient;
  let token: string;

  test.beforeEach(async ({ request }) => {
    bookingClient = new BookingClient(request, config.baseURL);
    authClient = new AuthClient(request, config.baseURL);
    token = await authClient.createToken(config.auth.username, config.auth.password);
  });

  test('DELETE /booking/{id} with valid token should delete booking', async () => {
    const createResponse = await bookingClient.createBooking(validBooking);
    const bookingId = createResponse.bookingid;

    const response = await bookingClient.deleteBooking(bookingId, token);
    expect(response).toBeTruthy();
  });

  test('DELETE /booking/{id} should remove booking from system', async () => {
    const createResponse = await bookingClient.createBooking(validBooking);
    const bookingId = createResponse.bookingid;

    await bookingClient.deleteBooking(bookingId, token);

    const response = await bookingClient.getBookingResponse(bookingId);
    expect(response.status()).toBe(404);
  });

  test('DELETE /booking/{id} without token should return 403', async () => {
    const createResponse = await bookingClient.createBooking(validBooking);
    const bookingId = createResponse.bookingid;

    const response = await bookingClient.deleteBookingResponse(bookingId, '');
    expect(response.status()).toBe(403);
  });

  test('DELETE /booking/{id} with invalid token should fail', async () => {
    const createResponse = await bookingClient.createBooking(validBooking);
    const bookingId = createResponse.bookingid;

    const response = await bookingClient.deleteBookingResponse(bookingId, 'invalid_token');
    expect(response.status()).toBe(403);
  });

  test('DELETE /booking/{id} on non-existent booking should return 405', async () => {
    const response = await bookingClient.deleteBookingResponse(999999999, token);
    expect(response.status()).toBe(405);
  });

  test('DELETE /booking/{id} twice should return 405 on second attempt', async () => {
    const createResponse = await bookingClient.createBooking(validBooking);
    const bookingId = createResponse.bookingid;

    await bookingClient.deleteBooking(bookingId, token);

    const secondDelete = await bookingClient.deleteBookingResponse(bookingId, token);
    expect(secondDelete.status()).toBe(405);
  });
});
