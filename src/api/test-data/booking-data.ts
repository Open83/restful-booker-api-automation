import { Booking } from '../models/booking.types';

export const validBooking: Booking = {
  firstname: 'John',
  lastname: 'Smith',
  totalprice: 150,
  depositpaid: true,
  bookingdates: {
    checkin: '2025-03-15',
    checkout: '2025-03-20',
  },
  additionalneeds: 'Breakfast',
};

export const validBooking2: Booking = {
  firstname: 'Jane',
  lastname: 'Doe',
  totalprice: 250,
  depositpaid: false,
  bookingdates: {
    checkin: '2025-04-01',
    checkout: '2025-04-10',
  },
  additionalneeds: 'Parking',
};

export const updatedBooking: Booking = {
  firstname: 'Robert',
  lastname: 'Johnson',
  totalprice: 300,
  depositpaid: true,
  bookingdates: {
    checkin: '2025-05-01',
    checkout: '2025-05-05',
  },
  additionalneeds: 'WiFi',
};

export const bookingWithoutAdditionalNeeds: Booking = {
  firstname: 'Alice',
  lastname: 'Williams',
  totalprice: 100,
  depositpaid: true,
  bookingdates: {
    checkin: '2025-06-01',
    checkout: '2025-06-02',
  },
};
