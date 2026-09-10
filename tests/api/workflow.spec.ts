import { test, expect } from '@playwright/test';
import { BookingClient } from '../../src/api/clients/booking-client';
import { AuthClient } from '../../src/api/clients/auth-client';
import { getConfig } from '../../src/api/config';
import { validBooking, updatedBooking } from '../../src/api/test-data/booking-data';

const config = getConfig();

test.describe('API Workflow - Full Booking Lifecycle', () => {
  test('Complete booking workflow: Create → Read → Update → Delete → Verify', async ({ request }) => {
    const bookingClient = new BookingClient(request, config.baseURL);
    const authClient = new AuthClient(request, config.baseURL);

    // Step 1: Authenticate
    const token = await authClient.createToken(config.auth.username, config.auth.password);
    expect(token).toBeTruthy();

    // Step 2: Create booking
    const createResponse = await bookingClient.createBooking(validBooking);
    const bookingId = createResponse.bookingid;
    expect(bookingId).toBeGreaterThan(0);
    expect(createResponse.booking).toEqual(validBooking);

    // Step 3: Retrieve booking
    const retrievedBooking = await bookingClient.getBooking(bookingId);
    expect(retrievedBooking.firstname).toBe(validBooking.firstname);
    expect(retrievedBooking.lastname).toBe(validBooking.lastname);
    expect(retrievedBooking.totalprice).toBe(validBooking.totalprice);

    // Step 4: Update booking
    const updatedResponse = await bookingClient.updateBooking(bookingId, updatedBooking, token);
    expect(updatedResponse.firstname).toBe(updatedBooking.firstname);
    expect(updatedResponse.lastname).toBe(updatedBooking.lastname);

    // Step 5: Verify update persisted
    const verifyUpdated = await bookingClient.getBooking(bookingId);
    expect(verifyUpdated.firstname).toBe(updatedBooking.firstname);
    expect(verifyUpdated.lastname).toBe(updatedBooking.lastname);
    expect(verifyUpdated.totalprice).toBe(updatedBooking.totalprice);

    // Step 6: Delete booking
    await bookingClient.deleteBooking(bookingId, token);

    // Step 7: Verify deletion
    const deleteVerifyResponse = await bookingClient.getBookingResponse(bookingId);
    expect(deleteVerifyResponse.status()).toBe(404);
  });

  test('Workflow: Create multiple bookings, list them, update one, delete one', async ({ request }) => {
    const bookingClient = new BookingClient(request, config.baseURL);
    const authClient = new AuthClient(request, config.baseURL);
    const token = await authClient.createToken(config.auth.username, config.auth.password);

    // Create first booking
    const create1 = await bookingClient.createBooking(validBooking);
    const bookingId1 = create1.bookingid;

    // Create second booking
    const create2 = await bookingClient.createBooking(validBooking);
    const bookingId2 = create2.bookingid;

    // List bookings (should include both)
    const bookingsList = await bookingClient.getBookings();
    const ids = bookingsList.map(b => b.bookingid);
    expect(ids).toContain(bookingId1);
    expect(ids).toContain(bookingId2);

    // Update first booking
    const updated = await bookingClient.updateBooking(bookingId1, updatedBooking, token);
    expect(updated.firstname).toBe(updatedBooking.firstname);

    // Delete first booking
    await bookingClient.deleteBooking(bookingId1, token);

    // Verify first is deleted, second still exists
    const deleteCheck = await bookingClient.getBookingResponse(bookingId1);
    expect(deleteCheck.status()).toBe(404);

    const stillExists = await bookingClient.getBooking(bookingId2);
    expect(stillExists.firstname).toBe(validBooking.firstname);

    // Cleanup: delete second booking
    await bookingClient.deleteBooking(bookingId2, token);
  });

  test('Partial update workflow: Create → Partial Update → Verify unchanged fields', async ({ request }) => {
    const bookingClient = new BookingClient(request, config.baseURL);
    const authClient = new AuthClient(request, config.baseURL);
    const token = await authClient.createToken(config.auth.username, config.auth.password);

    // Create booking
    const createResponse = await bookingClient.createBooking(validBooking);
    const bookingId = createResponse.bookingid;

    // Partial update - only firstname
    const partialUpdate = { firstname: 'PartialUpdateName' };
    const updated = await bookingClient.partialUpdateBooking(bookingId, partialUpdate, token);

    // Verify partial update worked
    expect(updated.firstname).toBe('PartialUpdateName');
    expect(updated.lastname).toBe(validBooking.lastname);
    expect(updated.totalprice).toBe(validBooking.totalprice);

    // Verify persistence
    const retrieved = await bookingClient.getBooking(bookingId);
    expect(retrieved.firstname).toBe('PartialUpdateName');
    expect(retrieved.lastname).toBe(validBooking.lastname);

    // Cleanup
    await bookingClient.deleteBooking(bookingId, token);
  });
});
