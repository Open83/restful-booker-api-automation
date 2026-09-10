import { test, expect } from '@playwright/test';
import { BookingClient } from '../../src/api/clients/booking-client';
import { AuthClient } from '../../src/api/clients/auth-client';
import { getConfig } from '../../src/api/config';
import { validBooking } from '../../src/api/test-data/booking-data';

const config = getConfig();

test.describe('Partial Update Booking (PATCH)', () => {
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

  test('PATCH /booking/{id} should update only specified fields', async () => {
    const partialUpdate = {
      firstname: 'UpdatedFirstName',
    };

    const updated = await bookingClient.partialUpdateBooking(bookingId, partialUpdate, token);

    expect(updated.firstname).toBe('UpdatedFirstName');
    expect(updated.lastname).toBe(validBooking.lastname);
    expect(updated.totalprice).toBe(validBooking.totalprice);
  });

  test('PATCH /booking/{id} should preserve unchanged fields', async () => {
    const partialUpdate = {
      totalprice: 500,
    };

    const updated = await bookingClient.partialUpdateBooking(bookingId, partialUpdate, token);

    expect(updated.totalprice).toBe(500);
    expect(updated.firstname).toBe(validBooking.firstname);
    expect(updated.lastname).toBe(validBooking.lastname);
    expect(updated.depositpaid).toBe(validBooking.depositpaid);
  });

  test('PATCH /booking/{id} with multiple fields should update all specified fields', async () => {
    const partialUpdate = {
      firstname: 'NewFirst',
      lastname: 'NewLast',
      depositpaid: false,
    };

    const updated = await bookingClient.partialUpdateBooking(bookingId, partialUpdate, token);

    expect(updated.firstname).toBe('NewFirst');
    expect(updated.lastname).toBe('NewLast');
    expect(updated.depositpaid).toBe(false);
  });

  test('PATCH /booking/{id} should persist changes', async () => {
    const partialUpdate = {
      additionalneeds: 'Updated needs',
    };

    await bookingClient.partialUpdateBooking(bookingId, partialUpdate, token);
    const retrieved = await bookingClient.getBooking(bookingId);

    expect(retrieved.additionalneeds).toBe('Updated needs');
  });

  test('PATCH /booking/{id} without token should return 403', async ({ request }) => {
    const partialUpdate = { firstname: 'NewName' };
    const response = await request.patch(
      `${config.baseURL}/booking/${bookingId}`,
      { data: partialUpdate }
    );

    expect(response.status()).toBe(403);
  });
});
