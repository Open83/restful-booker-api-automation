import { APIClient } from './api-client';
import { Booking, BookingResponse, CreateBookingResponse } from '../models/booking.types';
import { APIRequestContext, APIResponse } from '@playwright/test';

export class BookingClient extends APIClient {
  constructor(request: APIRequestContext, baseURL: string) {
    super(request, baseURL);
  }

  async getBookings(): Promise<Array<{ bookingid: number }>> {
    return this.get('/booking');
  }

  async createBooking(booking: Booking): Promise<CreateBookingResponse> {
    return this.post('/booking', booking);
  }

  async getBooking(bookingId: number): Promise<BookingResponse> {
    return this.get(`/booking/${bookingId}`);
  }

  async updateBooking(bookingId: number, booking: Booking, token: string): Promise<BookingResponse> {
    return this.put(`/booking/${bookingId}`, booking, token);
  }

  async partialUpdateBooking(bookingId: number, partialBooking: Partial<Booking>, token: string): Promise<BookingResponse> {
    return this.patch(`/booking/${bookingId}`, partialBooking, token);
  }

  async deleteBooking(bookingId: number, token: string): Promise<Record<string, any> | string> {
    return this.delete(`/booking/${bookingId}`, token);
  }

  async getBookingResponse(bookingId: number): Promise<APIResponse> {
    return this.getResponse(`/booking/${bookingId}`);
  }

  async updateBookingResponse(bookingId: number, booking: Booking, token: string): Promise<APIResponse> {
    return this.putResponse(`/booking/${bookingId}`, booking, token);
  }

  async deleteBookingResponse(bookingId: number, token: string): Promise<APIResponse> {
    return this.deleteResponse(`/booking/${bookingId}`, token);
  }
}
