import { test, expect } from '@playwright/test';
import { BookingClient } from '../../src/api/clients/booking-client';
import { getConfig } from '../../src/api/config';
import { validBooking } from '../../src/api/test-data/booking-data';

const config = getConfig();

test.describe('Get Booking', () => {
  let bookingClient: BookingClient;
  let bookingId: number;

  test.beforeEach(async ({ request }) => {
    bookingClient = new BookingClient(request, config.baseURL);
    const createResponse = await bookingClient.createBooking(validBooking);
    bookingId = createResponse.bookingid;
  });

  test('GET /booking/{id} should retrieve created booking', async () => {
    const booking = await bookingClient.getBooking(bookingId);

    expect(booking.firstname).toBe(validBooking.firstname);
    expect(booking.lastname).toBe(validBooking.lastname);
    expect(booking.totalprice).toBe(validBooking.totalprice);
    expect(booking.depositpaid).toBe(validBooking.depositpaid);
  });

  test('GET /booking/{id} should return all required fields', async () => {
    const booking = await bookingClient.getBooking(bookingId);

    expect(booking).toHaveProperty('firstname');
    expect(booking).toHaveProperty('lastname');
    expect(booking).toHaveProperty('totalprice');
    expect(booking).toHaveProperty('depositpaid');
    expect(booking).toHaveProperty('bookingdates');
  });

  test('GET /booking/{id} should return correct booking dates', async () => {
    const booking = await bookingClient.getBooking(bookingId);

    expect(booking.bookingdates.checkin).toBe(validBooking.bookingdates.checkin);
    expect(booking.bookingdates.checkout).toBe(validBooking.bookingdates.checkout);
  });

  test('GET /booking should return list of booking IDs', async () => {
    const bookings = await bookingClient.getBookings();

    expect(Array.isArray(bookings)).toBe(true);
    expect(bookings.length).toBeGreaterThan(0);
    expect(bookings[0]).toHaveProperty('bookingid');
    expect(typeof bookings[0].bookingid).toBe('number');
  });

  test('GET /booking/{id} with invalid ID should return error', async () => {
    const response = await bookingClient.getBookingResponse(999999999);

    expect(response.status()).toBe(404);
  });

  test('GET /booking/{id} with non-numeric ID should return 404', async ({ request }) => {
    const response = await request.get(`${config.baseURL}/booking/invalid`);

    expect(response.status()).toBe(404);
  });
});
