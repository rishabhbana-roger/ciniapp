export type UserRole = "USER" | "ADMIN";
export type SeatType = "STANDARD" | "PREMIUM" | "VIP" | "ACCESSIBLE";
export type SeatStatus = "AVAILABLE" | "HELD" | "BOOKED" | "BLOCKED";
export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED" | "REFUNDED";
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
export type TicketStatus = "ACTIVE" | "USED" | "VOID";

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Genre {
  id: string;
  name: string;
  slug: string;
}

export interface Movie {
  id: string;
  title: string;
  slug: string;
  synopsis: string;
  posterUrl: string;
  backdropUrl: string;
  trailerUrl: string;
  durationMins: number;
  releaseDate: string;
  language: string;
  rating: string;
  director: string;
  cast: string;
  isFeatured: boolean;
  genres?: Genre[];
  showtimes?: Showtime[];
}

export interface Cinema {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  imageUrl: string;
  amenities: string;
  auditoriums?: Auditorium[];
}

export interface Auditorium {
  id: string;
  cinemaId: string;
  name: string;
  screenType: "IMAX" | "DOLBY" | "STANDARD" | "4DX" | string;
  totalSeats: number;
  totalRows: number;
  totalCols: number;
}

export interface Seat {
  id: string;
  auditoriumId: string;
  row: string;
  number: number;
  seatType: SeatType;
  basePriceCents: number;
}

export interface Showtime {
  id: string;
  movieId: string;
  auditoriumId: string;
  startTime: string; // ISO UTC
  endTime: string; // ISO UTC
  basePriceCents: number;
  movie?: Movie;
  auditorium?: Auditorium & { cinema?: Cinema };
}

export interface ShowtimeSeatDetail {
  id: string; // showtime_seat id
  seatId: string;
  showtimeId: string;
  row: string;
  number: number;
  seatType: SeatType;
  status: SeatStatus;
  priceCents: number;
  heldByUserId?: string | null;
  heldUntil?: string | null;
}

export interface SeatHoldRequest {
  showtimeId: string;
  seatIds: string[]; // showtime_seat IDs or seat IDs
  userId?: string;
}

export interface SeatHoldResult {
  bookingId: string;
  bookingReference: string;
  showtimeId: string;
  seats: {
    showtimeSeatId: string;
    seatLabel: string;
    seatType: SeatType;
    priceCents: number;
  }[];
  subtotalCents: number;
  feeCents: number;
  taxCents: number;
  totalAmountCents: number;
  expiresAt: string; // ISO UTC
}

export interface PaymentProcessRequest {
  bookingId: string;
  idempotencyKey: string;
  paymentMethod: {
    cardNumber: string;
    expMonth: string;
    expYear: string;
    cvc: string;
    name: string;
  };
}

export interface PaymentProcessResult {
  success: boolean;
  bookingId: string;
  bookingReference: string;
  ticketId: string;
  ticketCode: string;
  paymentId: string;
  status: BookingStatus;
  message: string;
}

export interface BookingWithDetails {
  id: string;
  bookingReference: string;
  userId: string;
  showtimeId: string;
  status: BookingStatus;
  totalAmountCents: number;
  feeCents: number;
  taxCents: number;
  expiresAt: string;
  createdAt: string;
  movieTitle: string;
  moviePoster: string;
  cinemaName: string;
  cinemaCity: string;
  auditoriumName: string;
  screenType: string;
  showtimeStart: string;
  seats: {
    seatLabel: string;
    priceCents: number;
  }[];
  ticket?: {
    id: string;
    ticketCode: string;
    qrCodeData: string;
    status: TicketStatus;
  };
  payment?: {
    id: string;
    amountCents: number;
    status: PaymentStatus;
    provider: string;
  };
}

export interface FilterParams {
  query?: string;
  genre?: string;
  cinema?: string;
  language?: string;
  date?: string;
}
