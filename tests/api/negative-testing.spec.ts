import { test, expect } from '@playwright/test';
import { BookingClient } from '../../src/api/clients/booking-client';
import { AuthClient } from '../../src/api/clients/auth-client';
import { getConfig } from '../../src/api/config';
import { validBooking } from '../../src/api/test-data/booking-data';

const config = getConfig();

test.describe('Negative Testing', () => {
  let bookingClient: BookingClient;
  let authClient: AuthClient;

  test.beforeEach(async ({ request }) => {
    bookingClient = new BookingClient(request, config.baseURL);
    authClient = new AuthClient(request, config.baseURL);
  });

  test('POST /booking with zero price should be accepted', async () => {
    const bookingWithZeroPrice = {
      ...validBooking,
      totalprice: 0,
    };

    const response = await bookingClient.createBooking(bookingWithZeroPrice);
    expect(response.bookingid).toBeGreaterThan(0);
  });

  test('POST /booking with negative price is accepted by API', async ({ request }) => {
    const bookingWithNegativePrice = {
      ...validBooking,
      totalprice: -100,
    };

    const response = await bookingClient.postResponse('/booking', bookingWithNegativePrice);
    expect(response.ok).toBeTruthy();
  });

  test('POST /booking with invalid date format is accepted by API', async () => {
    const bookingWithInvalidDate = {
      ...validBooking,
      bookingdates: {
        checkin: 'invalid-date',
        checkout: '2025-03-20',
      },
    };

    const response = await bookingClient.postResponse('/booking', bookingWithInvalidDate);
    expect(response.ok).toBeTruthy();
  });

  test('POST /booking with checkout before checkin is accepted by API', async () => {
    const bookingWithBackwardDates = {
      ...validBooking,
      bookingdates: {
        checkin: '2025-03-20',
        checkout: '2025-03-15',
      },
    };

    const response = await bookingClient.postResponse('/booking', bookingWithBackwardDates);
    expect(response.ok).toBeTruthy();
  });

  test('PUT /booking with incomplete booking data should return 400', async () => {
    const token = await authClient.createToken(config.auth.username, config.auth.password);
    const createResponse = await bookingClient.createBooking(validBooking);
    const bookingId = createResponse.bookingid;

    const incompleteBooking = {
      firstname: 'John',
    };

    const response = await bookingClient.putResponse(`/booking/${bookingId}`, incompleteBooking, token);
    expect(response.status()).toBe(400);
  });

  test('GET /booking with string ID should return 404', async ({ request }) => {
    const response = await request.get(`${config.baseURL}/booking/abc123`);
    expect(response.status()).toBe(404);
  });

  test('POST /auth with special characters returns successful response', async () => {
    const response = await authClient.createTokenResponse('admin<script>', 'password');
    expect(response.status()).toBe(200);
  });

  test('POST /booking with very long string fields is accepted', async () => {
    const longString = 'A'.repeat(1000);
    const bookingWithLongField = {
      firstname: longString,
      lastname: validBooking.lastname,
      totalprice: validBooking.totalprice,
      depositpaid: validBooking.depositpaid,
      bookingdates: validBooking.bookingdates,
    };

    const response = await bookingClient.postResponse('/booking', bookingWithLongField);
    expect(response.status()).toBe(200);
  });
});
