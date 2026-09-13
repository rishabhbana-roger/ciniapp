import {
  pgTable,
  text,
  integer,
  timestamp,
  uuid,
  pgEnum,
  uniqueIndex,
  index,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Enums
export const roleEnum = pgEnum("user_role", ["USER", "ADMIN"]);
export const seatTypeEnum = pgEnum("seat_type", ["STANDARD", "PREMIUM", "VIP", "ACCESSIBLE"]);
export const seatStatusEnum = pgEnum("seat_status", ["AVAILABLE", "HELD", "BOOKED", "BLOCKED"]);
export const bookingStatusEnum = pgEnum("booking_status", [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "EXPIRED",
  "REFUNDED",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "COMPLETED",
  "FAILED",
  "REFUNDED",
]);
export const ticketStatusEnum = pgEnum("ticket_status", ["ACTIVE", "USED", "VOID"]);

// 1. Users table
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    role: text("role").default("USER").notNull(), // 'USER' | 'ADMIN'
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: index("users_email_idx").on(table.email),
  })
);

// 2. Genres table
export const genres = pgTable(
  "genres",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
    slug: text("slug").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: index("genres_slug_idx").on(table.slug),
  })
);

// 3. Movies table
export const movies = pgTable(
  "movies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    synopsis: text("synopsis").notNull(),
    posterUrl: text("poster_url").notNull(),
    backdropUrl: text("backdrop_url").notNull(),
    trailerUrl: text("trailer_url").default("").notNull(),
    durationMins: integer("duration_mins").notNull(),
    releaseDate: text("release_date").notNull(), // YYYY-MM-DD
    language: text("language").default("English").notNull(),
    rating: text("rating").default("PG-13").notNull(), // PG-13, R, etc.
    director: text("director").default("").notNull(),
    cast: text("cast").default("").notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    titleIdx: index("movies_title_idx").on(table.title),
    slugIdx: index("movies_slug_idx").on(table.slug),
    featuredIdx: index("movies_featured_idx").on(table.isFeatured),
  })
);

// 4. Movie-Genres Join table
export const movieGenres = pgTable(
  "movie_genres",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    movieId: uuid("movie_id")
      .references(() => movies.id, { onDelete: "cascade" })
      .notNull(),
    genreId: uuid("genre_id")
      .references(() => genres.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => ({
    movieGenreIdx: uniqueIndex("movie_genres_unique_idx").on(table.movieId, table.genreId),
  })
);

// 5. Cinemas table
export const cinemas = pgTable(
  "cinemas",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    city: text("city").notNull(),
    address: text("address").notNull(),
    phone: text("phone").default("").notNull(),
    imageUrl: text("image_url").default("").notNull(),
    amenities: text("amenities").default("IMAX, Dolby Atmos, Recliner Seats, Gourmet Popcorn").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    cityIdx: index("cinemas_city_idx").on(table.city),
  })
);

// 6. Auditoriums table
export const auditoriums = pgTable(
  "auditoriums",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cinemaId: uuid("cinema_id")
      .references(() => cinemas.id, { onDelete: "cascade" })
      .notNull(),
    name: text("name").notNull(),
    screenType: text("screen_type").default("STANDARD").notNull(), // IMAX, DOLBY, STANDARD, 4DX
    totalSeats: integer("total_seats").notNull(),
    totalRows: integer("total_rows").default(8).notNull(),
    totalCols: integer("total_cols").default(12).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    cinemaAuditoriumUniqueIdx: uniqueIndex("cinema_auditorium_name_unique_idx").on(
      table.cinemaId,
      table.name
    ),
  })
);

// 7. Seats table
export const seats = pgTable(
  "seats",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    auditoriumId: uuid("auditorium_id")
      .references(() => auditoriums.id, { onDelete: "cascade" })
      .notNull(),
    row: text("row").notNull(), // A, B, C...
    number: integer("number").notNull(), // 1, 2, 3...
    seatType: text("seat_type").default("STANDARD").notNull(), // STANDARD, PREMIUM, VIP, ACCESSIBLE
    basePriceCents: integer("base_price_cents").default(1200).notNull(), // in cents ($12.00)
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    auditoriumSeatUniqueIdx: uniqueIndex("auditorium_seat_position_unique_idx").on(
      table.auditoriumId,
      table.row,
      table.number
    ),
    auditoriumIdx: index("seats_auditorium_idx").on(table.auditoriumId),
  })
);

// 8. Showtimes table
export const showtimes = pgTable(
  "showtimes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    movieId: uuid("movie_id")
      .references(() => movies.id, { onDelete: "cascade" })
      .notNull(),
    auditoriumId: uuid("auditorium_id")
      .references(() => auditoriums.id, { onDelete: "cascade" })
      .notNull(),
    startTime: timestamp("start_time", { withTimezone: true }).notNull(),
    endTime: timestamp("end_time", { withTimezone: true }).notNull(),
    basePriceCents: integer("base_price_cents").default(1500).notNull(), // in cents ($15.00)
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    movieIdx: index("showtimes_movie_idx").on(table.movieId),
    auditoriumIdx: index("showtimes_auditorium_idx").on(table.auditoriumId),
    startTimeIdx: index("showtimes_start_time_idx").on(table.startTime),
  })
);

// 9. Showtime Seats table (State of each seat for a specific showtime)
export const showtimeSeats = pgTable(
  "showtime_seats",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    showtimeId: uuid("showtime_id")
      .references(() => showtimes.id, { onDelete: "cascade" })
      .notNull(),
    seatId: uuid("seat_id")
      .references(() => seats.id, { onDelete: "cascade" })
      .notNull(),
    status: text("status").default("AVAILABLE").notNull(), // AVAILABLE, HELD, BOOKED, BLOCKED
    heldByUserId: uuid("held_by_user_id").references(() => users.id, { onDelete: "set null" }),
    heldUntil: timestamp("held_until", { withTimezone: true }),
    priceCents: integer("price_cents").notNull(),
    version: integer("version").default(1).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    showtimeSeatUniqueIdx: uniqueIndex("showtime_seat_unique_idx").on(
      table.showtimeId,
      table.seatId
    ),
    showtimeStatusIdx: index("showtime_seats_status_idx").on(table.showtimeId, table.status),
    heldUntilIdx: index("showtime_seats_held_until_idx").on(table.heldUntil),
  })
);

// 10. Bookings table
export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingReference: text("booking_reference").notNull().unique(), // e.g. CNB-7A49F
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    showtimeId: uuid("showtime_id")
      .references(() => showtimes.id, { onDelete: "cascade" })
      .notNull(),
    status: text("status").default("PENDING").notNull(), // PENDING, CONFIRMED, CANCELLED, EXPIRED, REFUNDED
    totalAmountCents: integer("total_amount_cents").notNull(),
    feeCents: integer("fee_cents").default(0).notNull(), // Booking/Convenience fee
    taxCents: integer("tax_cents").default(0).notNull(), // Sales tax
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userBookingsIdx: index("bookings_user_id_idx").on(table.userId),
    refIdx: index("bookings_reference_idx").on(table.bookingReference),
    statusIdx: index("bookings_status_idx").on(table.status),
  })
);

// 11. Booking Items table
export const bookingItems = pgTable(
  "booking_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingId: uuid("booking_id")
      .references(() => bookings.id, { onDelete: "cascade" })
      .notNull(),
    showtimeSeatId: uuid("showtime_seat_id")
      .references(() => showtimeSeats.id, { onDelete: "cascade" })
      .notNull(),
    priceCents: integer("price_cents").notNull(),
    seatLabel: text("seat_label").notNull(), // e.g., "E-7 (VIP)"
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    bookingIdx: index("booking_items_booking_idx").on(table.bookingId),
    showtimeSeatIdx: index("booking_items_showtime_seat_idx").on(table.showtimeSeatId),
  })
);

// 12. Payments table
export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingId: uuid("booking_id")
      .references(() => bookings.id, { onDelete: "cascade" })
      .notNull(),
    idempotencyKey: text("idempotency_key").notNull().unique(),
    provider: text("provider").default("SYSTEM_TEST").notNull(), // STRIPE_TEST, SYSTEM_TEST
    providerPaymentId: text("provider_payment_id").default("").notNull(),
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").default("usd").notNull(),
    status: text("status").default("PENDING").notNull(), // PENDING, COMPLETED, FAILED, REFUNDED
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    bookingPaymentIdx: index("payments_booking_id_idx").on(table.bookingId),
    idempotencyIdx: index("payments_idempotency_key_idx").on(table.idempotencyKey),
  })
);

// 13. Tickets table
export const tickets = pgTable(
  "tickets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingId: uuid("booking_id")
      .references(() => bookings.id, { onDelete: "cascade" })
      .notNull(),
    ticketCode: text("ticket_code").notNull().unique(), // e.g. TKT-9831-ABCD
    qrCodeData: text("qr_code_data").notNull(),
    status: text("status").default("ACTIVE").notNull(), // ACTIVE, USED, VOID
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    ticketCodeIdx: index("tickets_ticket_code_idx").on(table.ticketCode),
    bookingTicketIdx: index("tickets_booking_id_idx").on(table.bookingId),
  })
);

// 14. Audit Logs table
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    action: text("action").notNull(), // SEAT_HOLD, BOOKING_CREATED, PAYMENT_SUCCESS, BOOKING_CANCELLED, HOLDS_RELEASED, MOVIE_CREATED
    entityType: text("entity_type").notNull(), // booking, payment, showtime_seat, movie, user
    entityId: text("entity_id").notNull(),
    metadata: jsonb("metadata").default({}).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    actionIdx: index("audit_logs_action_idx").on(table.action),
    entityIdx: index("audit_logs_entity_idx").on(table.entityType, table.entityId),
    createdAtIdx: index("audit_logs_created_at_idx").on(table.createdAt),
  })
);
