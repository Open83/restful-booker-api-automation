import { test, expect } from '@playwright/test';
import { BookingClient } from '../../src/api/clients/booking-client';
import { getConfig } from '../../src/api/config';
import { validBooking, bookingWithoutAdditionalNeeds } from '../../src/api/test-data/booking-data';

const config = getConfig();

test.describe('Create Booking', () => {
  let bookingClient: BookingClient;

  test.beforeEach(async ({ request }) => {
    bookingClient = new BookingClient(request, config.baseURL);
  });

  test('POST /booking with valid data should create booking successfully', async () => {
    const response = await bookingClient.createBooking(validBooking);

    expect(response).toHaveProperty('bookingid');
    expect(response).toHaveProperty('booking');
    expect(typeof response.bookingid).toBe('number');
    expect(response.bookingid).toBeGreaterThan(0);
  });

  test('POST /booking should return booking data in response', async () => {
    const response = await bookingClient.createBooking(validBooking);

    expect(response.booking).toEqual(validBooking);
    expect(response.booking.firstname).toBe('John');
    expect(response.booking.lastname).toBe('Smith');
    expect(response.booking.totalprice).toBe(150);
    expect(response.booking.depositpaid).toBe(true);
  });

  test('POST /booking with numeric fields should maintain data types', async () => {
    const response = await bookingClient.createBooking(validBooking);

    expect(typeof response.booking.totalprice).toBe('number');
    expect(typeof response.booking.depositpaid).toBe('boolean');
    expect(typeof response.bookingid).toBe('number');
  });

  test('POST /booking should generate unique booking IDs', async () => {
    const response1 = await bookingClient.createBooking(validBooking);
    const response2 = await bookingClient.createBooking(validBooking);

    expect(response1.bookingid).not.toBe(response2.bookingid);
  });

  test('POST /booking without additionalneeds field should succeed', async () => {
    const response = await bookingClient.createBooking(bookingWithoutAdditionalNeeds);

    expect(response.bookingid).toBeGreaterThan(0);
    expect(response.booking).toEqual(bookingWithoutAdditionalNeeds);
  });

  test('POST /booking with missing firstname should return 500', async ({ request }) => {
    const bookingClient = new BookingClient(request, config.baseURL);
    const invalidBooking = {
      lastname: 'Smith',
      totalprice: 150,
      depositpaid: true,
      bookingdates: {
        checkin: '2025-03-15',
        checkout: '2025-03-20',
      },
    };

    const response = await bookingClient.postResponse('/booking', invalidBooking);
    expect(response.status()).toBe(500);
  });

  test('POST /booking with missing bookingdates should return 500', async ({ request }) => {
    const bookingClient = new BookingClient(request, config.baseURL);
    const invalidBooking = {
      firstname: 'John',
      lastname: 'Smith',
      totalprice: 150,
      depositpaid: true,
    };

    const response = await bookingClient.postResponse('/booking', invalidBooking);
    expect(response.status()).toBe(500);
  });
});
