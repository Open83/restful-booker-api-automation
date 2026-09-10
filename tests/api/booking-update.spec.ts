import { test, expect } from '@playwright/test';
import { BookingClient } from '../../src/api/clients/booking-client';
import { AuthClient } from '../../src/api/clients/auth-client';
import { getConfig } from '../../src/api/config';
import { validBooking, updatedBooking } from '../../src/api/test-data/booking-data';

const config = getConfig();

test.describe('Update Booking (PUT)', () => {
  let bookingClient: BookingClient;
  let authClient: AuthClient;
  let bookingId: number;
  let token: string;

  test.beforeEach(async ({ request }) => {
    bookingClient = new BookingClient(request, config.baseURL);
    authClient = new AuthClient(request, config.baseURL);

    const createResponse = await bookingClient.createBooking(validBooking);
    bookingId = createResponse.bookingid;
    token = await authClient.createToken(config.auth.username, config.auth.password);
  });

  test('PUT /booking/{id} with valid token should update booking', async () => {
    const updated = await bookingClient.updateBooking(bookingId, updatedBooking, token);

    expect(updated.firstname).toBe(updatedBooking.firstname);
    expect(updated.lastname).toBe(updatedBooking.lastname);
    expect(updated.totalprice).toBe(updatedBooking.totalprice);
  });

  test('PUT /booking/{id} should persist updated data', async () => {
    await bookingClient.updateBooking(bookingId, updatedBooking, token);

    const retrieved = await bookingClient.getBooking(bookingId);
    expect(retrieved.firstname).toBe(updatedBooking.firstname);
    expect(retrieved.lastname).toBe(updatedBooking.lastname);
  });

  test('PUT /booking/{id} without token should return 403', async () => {
    const response = await bookingClient.updateBookingResponse(bookingId, updatedBooking, '');

    expect(response.status()).toBe(403);
  });

  test('PUT /booking/{id} with invalid token should fail', async () => {
    const response = await bookingClient.updateBookingResponse(bookingId, updatedBooking, 'invalid_token');

    expect(response.status()).toBe(403);
  });

  test('PUT /booking/{id} should update all fields completely', async () => {
    await bookingClient.updateBooking(bookingId, updatedBooking, token);

    const booking = await bookingClient.getBooking(bookingId);
    expect(booking).toEqual(updatedBooking);
  });

  test('PUT /booking/{id} on non-existent booking should return 405', async () => {
    const response = await bookingClient.updateBookingResponse(999999999, updatedBooking, token);

    expect(response.status()).toBe(405);
  });
});
