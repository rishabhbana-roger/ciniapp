import {
  Movie,
  Cinema,
  Auditorium,
  Showtime,
  ShowtimeSeatDetail,
  SeatHoldResult,
  PaymentProcessResult,
  BookingWithDetails,
  FilterParams,
  UserSession,
} from "@/lib/types";
import {
  SEED_GENRES,
  SEED_MOVIES,
  SEED_CINEMAS,
  SEED_USERS,
} from "@/lib/data/mock-seed-data";
import { generateBookingReference, generateTicketCode } from "@/lib/utils";
import bcrypt from "bcryptjs";

// In-Memory state store initialized from seed data
// Used to provide instant, zero-latency reactive state and reliable concurrency testing
interface DataStore {
  users: Array<{
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    role: "USER" | "ADMIN";
    createdAt: string;
    updatedAt: string;
  }>;
  genres: Array<{ id: string; name: string; slug: string; createdAt: string }>;
  movies: Array<Movie & { createdAt: string; updatedAt: string }>;
  movieGenres: Array<{ id: string; movieId: string; genreId: string }>;
  cinemas: Array<Cinema & { createdAt: string }>;
  auditoriums: Array<Auditorium & { createdAt: string }>;
  seats: Array<{
    id: string;
    auditoriumId: string;
    row: string;
    number: number;
    seatType: "STANDARD" | "PREMIUM" | "VIP" | "ACCESSIBLE";
    basePriceCents: number;
  }>;
  showtimes: Array<Showtime & { createdAt: string }>;
  showtimeSeats: Array<{
    id: string;
    showtimeId: string;
    seatId: string;
    status: "AVAILABLE" | "HELD" | "BOOKED" | "BLOCKED";
    heldByUserId: string | null;
    heldUntil: string | null;
    priceCents: number;
    version: number;
    updatedAt: string;
  }>;
  bookings: Array<{
    id: string;
    bookingReference: string;
    userId: string;
    showtimeId: string;
    status: "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED" | "REFUNDED";
    totalAmountCents: number;
    feeCents: number;
    taxCents: number;
    expiresAt: string;
    createdAt: string;
    updatedAt: string;
  }>;
  bookingItems: Array<{
    id: string;
    bookingId: string;
    showtimeSeatId: string;
    priceCents: number;
    seatLabel: string;
    createdAt: string;
  }>;
  payments: Array<{
    id: string;
    bookingId: string;
    idempotencyKey: string;
    provider: string;
    providerPaymentId: string;
    amountCents: number;
    currency: string;
    status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
    createdAt: string;
    updatedAt: string;
  }>;
  tickets: Array<{
    id: string;
    bookingId: string;
    ticketCode: string;
    qrCodeData: string;
    status: "ACTIVE" | "USED" | "VOID";
    createdAt: string;
  }>;
  auditLogs: Array<{
    id: string;
    userId: string | null;
    action: string;
    entityType: string;
    entityId: string;
    metadata: Record<string, any>;
    createdAt: string;
  }>;
}

function generateUuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function initializeStore(): DataStore {
  const store: DataStore = {
    users: [],
    genres: [],
    movies: [],
    movieGenres: [],
    cinemas: [],
    auditoriums: [],
    seats: [],
    showtimes: [],
    showtimeSeats: [],
    bookings: [],
    bookingItems: [],
    payments: [],
    tickets: [],
    auditLogs: [],
  };

  const now = new Date().toISOString();

  // 1. Seed Users
  for (const u of SEED_USERS) {
    store.users.push({
      id: generateUuid(),
      email: u.email,
      passwordHash: bcrypt.hashSync(u.passwordPlain, 8),
      name: u.name,
      role: u.role,
      createdAt: now,
      updatedAt: now,
    });
  }

  // 2. Seed Genres
  for (const g of SEED_GENRES) {
    store.genres.push({
      id: generateUuid(),
      name: g.name,
      slug: g.slug,
      createdAt: now,
    });
  }

  // 3. Seed Movies & MovieGenres
  for (const m of SEED_MOVIES) {
    const movieId = generateUuid();
    const movieObj: Movie & { createdAt: string; updatedAt: string } = {
      id: movieId,
      title: m.title,
      slug: m.slug,
      synopsis: m.synopsis,
      posterUrl: m.posterUrl,
      backdropUrl: m.backdropUrl,
      trailerUrl: m.trailerUrl,
      durationMins: m.durationMins,
      releaseDate: m.releaseDate,
      language: m.language,
      rating: m.rating,
      director: m.director,
      cast: m.cast,
      isFeatured: m.isFeatured,
      genres: [],
      createdAt: now,
      updatedAt: now,
    };

    // link genres
    for (const gName of m.genres) {
      const foundGenre = store.genres.find((g) => g.name === gName);
      if (foundGenre) {
        store.movieGenres.push({
          id: generateUuid(),
          movieId,
          genreId: foundGenre.id,
        });
        movieObj.genres?.push(foundGenre);
      }
    }
    store.movies.push(movieObj);
  }

  // 4. Seed Cinemas, Auditoriums, Seats
  for (const c of SEED_CINEMAS) {
    const cinemaId = generateUuid();
    store.cinemas.push({
      id: cinemaId,
      name: c.name,
      city: c.city,
      address: c.address,
      phone: c.phone,
      imageUrl: c.imageUrl,
      amenities: c.amenities,
      createdAt: now,
    });

    for (const a of c.auditoriums) {
      const audId = generateUuid();
      const totalSeats = a.totalRows * a.totalCols;
      store.auditoriums.push({
        id: audId,
        cinemaId,
        name: a.name,
        screenType: a.screenType,
        totalSeats,
        totalRows: a.totalRows,
        totalCols: a.totalCols,
        createdAt: now,
      });

      // Generate seats
      const rowLetters = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"];
      for (let r = 0; r < a.totalRows; r++) {
        const rowLetter = rowLetters[r] || `R${r + 1}`;
        for (let col = 1; col <= a.totalCols; col++) {
          let seatType: "STANDARD" | "PREMIUM" | "VIP" | "ACCESSIBLE" = "STANDARD";
          let basePriceCents = 1400; // $14.00

          // Center rows E & F are VIP, C & D are Premium, front row has Accessible
          if (r === 0 && (col === 1 || col === 2)) {
            seatType = "ACCESSIBLE";
            basePriceCents = 1200;
          } else if (r >= 4 && r <= 5 && col >= 3 && col <= a.totalCols - 2) {
            seatType = "VIP";
            basePriceCents = 2200; // $22.00
          } else if (r >= 2 && r <= 5) {
            seatType = "PREMIUM";
            basePriceCents = 1800; // $18.00
          }

          if (a.screenType === "IMAX") basePriceCents += 400;
          if (a.screenType === "DOLBY") basePriceCents += 300;
          if (a.screenType === "4DX") basePriceCents += 600;

          store.seats.push({
            id: generateUuid(),
            auditoriumId: audId,
            row: rowLetter,
            number: col,
            seatType,
            basePriceCents,
          });
        }
      }
    }
  }

  // 5. Seed Showtimes for Today and Upcoming Days
  const today = new Date();
  const times = ["11:30", "14:15", "17:00", "19:45", "22:30"];

  for (let dayOffset = 0; dayOffset <= 4; dayOffset++) {
    const date = new Date(today);
    date.setDate(today.getDate() + dayOffset);
    const dateStr = date.toISOString().split("T")[0];

    for (let mIdx = 0; mIdx < store.movies.length; mIdx++) {
      const movie = store.movies[mIdx];
      // Pick 2-3 auditoriums for this movie
      const auds = store.auditoriums.filter((_, i) => (i + mIdx) % 3 === 0 || i === 0);

      for (const aud of auds) {
        // Pick 2 showtime slots per day per aud
        const timeSlots = dayOffset === 0 ? [times[1], times[3]] : [times[0], times[2], times[4]];

        for (const slot of timeSlots) {
          const [hours, mins] = slot.split(":").map(Number);
          const showtimeStart = new Date(`${dateStr}T${slot}:00.000Z`);
          showtimeStart.setUTCHours(hours, mins, 0, 0);

          const showtimeEnd = new Date(showtimeStart);
          showtimeEnd.setMinutes(showtimeEnd.getMinutes() + movie.durationMins + 20);

          const showtimeId = generateUuid();
          const basePriceCents = aud.screenType === "IMAX" ? 2000 : aud.screenType === "DOLBY" ? 1800 : 1500;

          store.showtimes.push({
            id: showtimeId,
            movieId: movie.id,
            auditoriumId: aud.id,
            startTime: showtimeStart.toISOString(),
            endTime: showtimeEnd.toISOString(),
            basePriceCents,
            createdAt: now,
          });

          // Pre-generate showtime_seats for this showtime
          const audSeats = store.seats.filter((s) => s.auditoriumId === aud.id);
          for (const seat of audSeats) {
            // Randomly mark a few realistic seats as BOOKED for realistic feel
            const isBooked = (parseInt(seat.row.charCodeAt(0).toString()) + seat.number + mIdx + dayOffset) % 17 === 0;

            store.showtimeSeats.push({
              id: generateUuid(),
              showtimeId,
              seatId: seat.id,
              status: isBooked ? "BOOKED" : "AVAILABLE",
              heldByUserId: null,
              heldUntil: null,
              priceCents: seat.basePriceCents,
              version: 1,
              updatedAt: now,
            });
          }
        }
      }
    }
  }

  return store;
}

// Global singleton in-memory store attached to globalThis to persist across Next.js API reloads
declare global {
  // eslint-disable-next-line no-var
  var __CINEBOOK_STORE__: DataStore | undefined;
}

export function getStore(): DataStore {
  if (!globalThis.__CINEBOOK_STORE__) {
    globalThis.__CINEBOOK_STORE__ = initializeStore();
  }
  return globalThis.__CINEBOOK_STORE__;
}

export const repository = {
  // --- USERS & AUTH ---
  async getUserByEmail(email: string) {
    const store = getStore();
    return store.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async getUserById(id: string) {
    const store = getStore();
    return store.users.find((u) => u.id === id) || null;
  },

  async createUser(name: string, email: string, passwordPlain: string, role: "USER" | "ADMIN" = "USER") {
    const store = getStore();
    const existing = await this.getUserByEmail(email);
    if (existing) throw new Error("Email already registered");

    const passwordHash = await bcrypt.hash(passwordPlain, 10);
    const now = new Date().toISOString();
    const newUser = {
      id: generateUuid(),
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      createdAt: now,
      updatedAt: now,
    };
    store.users.push(newUser);

    store.auditLogs.push({
      id: generateUuid(),
      userId: newUser.id,
      action: "USER_REGISTERED",
      entityType: "user",
      entityId: newUser.id,
      metadata: { email: newUser.email, role: newUser.role },
      createdAt: now,
    });

    return newUser;
  },

  // --- MOVIES & GENRES ---
  async getGenres() {
    const store = getStore();
    return store.genres;
  },

  async getMovies(filters?: FilterParams) {
    const store = getStore();
    let result = store.movies.map((m) => {
      const movieGenresList = store.movieGenres
        .filter((mg) => mg.movieId === m.id)
        .map((mg) => store.genres.find((g) => g.id === mg.genreId)!)
        .filter(Boolean);

      return {
        ...m,
        genres: movieGenresList,
      };
    });

    if (filters?.query) {
      const q = filters.query.toLowerCase();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.director.toLowerCase().includes(q) ||
          m.cast.toLowerCase().includes(q)
      );
    }

    if (filters?.genre && filters.genre !== "all") {
      const gSlug = filters.genre.toLowerCase();
      result = result.filter((m) =>
        m.genres?.some((g) => g.slug === gSlug || g.name.toLowerCase() === gSlug)
      );
    }

    if (filters?.language && filters.language !== "all") {
      const lang = filters.language.toLowerCase();
      result = result.filter((m) => m.language.toLowerCase().includes(lang));
    }

    return result;
  },

  async getMovieById(idOrSlug: string) {
    const store = getStore();
    const movie = store.movies.find((m) => m.id === idOrSlug || m.slug === idOrSlug);
    if (!movie) return null;

    const movieGenresList = store.movieGenres
      .filter((mg) => mg.movieId === movie.id)
      .map((mg) => store.genres.find((g) => g.id === mg.genreId)!)
      .filter(Boolean);

    // Get upcoming showtimes for this movie
    const showtimesList = store.showtimes
      .filter((s) => s.movieId === movie.id)
      .map((s) => {
        const aud = store.auditoriums.find((a) => a.id === s.auditoriumId);
        const cin = aud ? store.cinemas.find((c) => c.id === aud.cinemaId) : undefined;
        return {
          ...s,
          auditorium: aud ? { ...aud, cinema: cin } : undefined,
        };
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    return {
      ...movie,
      genres: movieGenresList,
      showtimes: showtimesList,
    };
  },

  async createMovie(data: {
    title: string;
    synopsis: string;
    posterUrl: string;
    backdropUrl: string;
    trailerUrl?: string;
    durationMins: number;
    releaseDate: string;
    language?: string;
    rating?: string;
    director?: string;
    cast?: string;
    genreIds?: string[];
  }) {
    const store = getStore();
    const id = generateUuid();
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const now = new Date().toISOString();

    const newMovie: Movie & { createdAt: string; updatedAt: string } = {
      id,
      title: data.title,
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      synopsis: data.synopsis,
      posterUrl: data.posterUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80",
      backdropUrl: data.backdropUrl || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80",
      trailerUrl: data.trailerUrl || "",
      durationMins: data.durationMins || 120,
      releaseDate: data.releaseDate || new Date().toISOString().split("T")[0],
      language: data.language || "English",
      rating: data.rating || "PG-13",
      director: data.director || "Director",
      cast: data.cast || "Cast members",
      isFeatured: false,
      createdAt: now,
      updatedAt: now,
    };

    store.movies.push(newMovie);

    if (data.genreIds && data.genreIds.length > 0) {
      for (const gId of data.genreIds) {
        store.movieGenres.push({
          id: generateUuid(),
          movieId: id,
          genreId: gId,
        });
      }
    }

    store.auditLogs.push({
      id: generateUuid(),
      userId: null,
      action: "MOVIE_CREATED",
      entityType: "movie",
      entityId: id,
      metadata: { title: newMovie.title },
      createdAt: now,
    });

    return newMovie;
  },

  // --- CINEMAS & AUDITORIUMS ---
  async getCinemas() {
    const store = getStore();
    return store.cinemas.map((c) => {
      const auds = store.auditoriums.filter((a) => a.cinemaId === c.id);
      return { ...c, auditoriums: auds };
    });
  },

  async getCinemaById(id: string) {
    const store = getStore();
    const cinema = store.cinemas.find((c) => c.id === id);
    if (!cinema) return null;

    const auds = store.auditoriums.filter((a) => a.cinemaId === cinema.id);
    const audIds = auds.map((a) => a.id);
    const showtimes = store.showtimes
      .filter((s) => audIds.includes(s.auditoriumId))
      .map((s) => {
        const mov = store.movies.find((m) => m.id === s.movieId);
        const aud = auds.find((a) => a.id === s.auditoriumId);
        return {
          ...s,
          movie: mov,
          auditorium: aud,
        };
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    return {
      ...cinema,
      auditoriums: auds,
      showtimes,
    };
  },

  // --- SHOWTIMES & SEAT MAP ---
  async getShowtimeById(id: string) {
    const store = getStore();
    const showtime = store.showtimes.find((s) => s.id === id);
    if (!showtime) return null;

    const movie = store.movies.find((m) => m.id === showtime.movieId);
    const aud = store.auditoriums.find((a) => a.id === showtime.auditoriumId);
    const cinema = aud ? store.cinemas.find((c) => c.id === aud.cinemaId) : undefined;

    return {
      ...showtime,
      movie,
      auditorium: aud ? { ...aud, cinema } : undefined,
    };
  },

  async getShowtimeSeatMap(showtimeId: string, currentUserId?: string | null) {
    // 1. Release any expired holds first
    await this.releaseExpiredHolds();

    const store = getStore();
    const showtime = await this.getShowtimeById(showtimeId);
    if (!showtime || !showtime.auditorium) return null;

    const stSeats = store.showtimeSeats.filter((ss) => ss.showtimeId === showtimeId);
    const seatsList = store.seats.filter((s) => s.auditoriumId === showtime.auditoriumId);

    const seatMap: ShowtimeSeatDetail[] = stSeats.map((ss) => {
      const originalSeat = seatsList.find((s) => s.id === ss.seatId);
      const isMyHold = currentUserId && ss.heldByUserId === currentUserId && ss.status === "HELD";

      return {
        id: ss.id,
        seatId: ss.seatId,
        showtimeId: ss.showtimeId,
        row: originalSeat?.row || "A",
        number: originalSeat?.number || 1,
        seatType: originalSeat?.seatType || "STANDARD",
        status: isMyHold ? "AVAILABLE" : ss.status, // Treat user's own active hold as available to reselect or advance
        priceCents: ss.priceCents,
        heldByUserId: ss.heldByUserId,
        heldUntil: ss.heldUntil,
      };
    });

    // Sort by row then column
    seatMap.sort((a, b) => {
      if (a.row === b.row) return a.number - b.number;
      return a.row.localeCompare(b.row);
    });

    return {
      showtime,
      seatMap,
      auditorium: showtime.auditorium,
    };
  },

  // --- SEAT HOLD TRANSACTION ---
  // Atomic transaction locking showtime seats for 10 minutes
  async holdSeats(showtimeId: string, seatIdsOrShowtimeSeatIds: string[], userId: string): Promise<SeatHoldResult> {
    const store = getStore();
    const now = new Date();

    // 1. Release expired holds to free up stale seats
    await this.releaseExpiredHolds();

    const showtime = store.showtimes.find((s) => s.id === showtimeId);
    if (!showtime) throw new Error("Showtime not found");

    if (!seatIdsOrShowtimeSeatIds || seatIdsOrShowtimeSeatIds.length === 0) {
      throw new Error("No seats specified for reservation");
    }

    // Resolve matching showtime_seats
    const targetSeats = store.showtimeSeats.filter(
      (ss) =>
        ss.showtimeId === showtimeId &&
        (seatIdsOrShowtimeSeatIds.includes(ss.id) || seatIdsOrShowtimeSeatIds.includes(ss.seatId))
    );

    if (targetSeats.length !== seatIdsOrShowtimeSeatIds.length) {
      throw new Error("Some requested seats do not exist for this showtime");
    }

    // 2. ATOMIC LOCK CHECK: Confirm every requested seat is AVAILABLE
    // or currently held by this same user and unexpired
    for (const ss of targetSeats) {
      const isAvailable = ss.status === "AVAILABLE";
      const isHeldBySameUser = ss.status === "HELD" && ss.heldByUserId === userId;

      if (!isAvailable && !isHeldBySameUser) {
        const seatInfo = store.seats.find((s) => s.id === ss.seatId);
        const seatLabel = seatInfo ? `${seatInfo.row}${seatInfo.number}` : "Selected seat";
        const conflictErr = new Error(`Seat ${seatLabel} is no longer available (${ss.status.toLowerCase()}).`);
        (conflictErr as any).code = "SEAT_UNAVAILABLE";
        (conflictErr as any).status = 409;
        throw conflictErr;
      }
    }

    // 3. Create temporary seat hold with 10 minute expiration
    const holdDurationMinutes = 10;
    const expiresAtDate = new Date(now.getTime() + holdDurationMinutes * 60 * 1000);
    const expiresAt = expiresAtDate.toISOString();

    const bookedSeatsSummary: {
      showtimeSeatId: string;
      seatLabel: string;
      seatType: "STANDARD" | "PREMIUM" | "VIP" | "ACCESSIBLE";
      priceCents: number;
    }[] = [];

    let subtotalCents = 0;

    for (const ss of targetSeats) {
      const seat = store.seats.find((s) => s.id === ss.seatId)!;
      ss.status = "HELD";
      ss.heldByUserId = userId;
      ss.heldUntil = expiresAt;
      ss.version += 1;
      ss.updatedAt = now.toISOString();

      subtotalCents += ss.priceCents;
      bookedSeatsSummary.push({
        showtimeSeatId: ss.id,
        seatLabel: `${seat.row}${seat.number} (${seat.seatType})`,
        seatType: seat.seatType,
        priceCents: ss.priceCents,
      });
    }

    // 4. Calculate prices on server (Integer Minor Units: Cents)
    const feeCents = Math.round(subtotalCents * 0.1); // 10% booking fee
    const taxCents = Math.round(subtotalCents * 0.05); // 5% state cinema tax
    const totalAmountCents = subtotalCents + feeCents + taxCents;

    // 5. Create pending booking record
    const bookingId = generateUuid();
    const bookingReference = generateBookingReference();

    const newBooking = {
      id: bookingId,
      bookingReference,
      userId,
      showtimeId,
      status: "PENDING" as const,
      totalAmountCents,
      feeCents,
      taxCents,
      expiresAt,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    store.bookings.push(newBooking);

    // 6. Create booking items
    for (const item of bookedSeatsSummary) {
      store.bookingItems.push({
        id: generateUuid(),
        bookingId,
        showtimeSeatId: item.showtimeSeatId,
        priceCents: item.priceCents,
        seatLabel: item.seatLabel,
        createdAt: now.toISOString(),
      });
    }

    // 7. Audit log
    store.auditLogs.push({
      id: generateUuid(),
      userId,
      action: "SEAT_HOLD_CREATED",
      entityType: "booking",
      entityId: bookingId,
      metadata: {
        bookingReference,
        seatsCount: targetSeats.length,
        totalAmountCents,
        expiresAt,
      },
      createdAt: now.toISOString(),
    });

    return {
      bookingId,
      bookingReference,
      showtimeId,
      seats: bookedSeatsSummary,
      subtotalCents,
      feeCents,
      taxCents,
      totalAmountCents,
      expiresAt,
    };
  },

  // --- PAYMENT & BOOKING CONFIRMATION ---
  async processPaymentAndConfirm(
    bookingId: string,
    idempotencyKey: string,
    userId: string,
    provider: string = "SYSTEM_TEST"
  ): Promise<PaymentProcessResult> {
    const store = getStore();
    const now = new Date();

    // 1. Idempotency Check: if already processed with this key, return existing confirmation
    const existingPayment = store.payments.find((p) => p.idempotencyKey === idempotencyKey);
    if (existingPayment) {
      const booking = store.bookings.find((b) => b.id === existingPayment.bookingId);
      const ticket = store.tickets.find((t) => t.bookingId === existingPayment.bookingId);
      if (booking && ticket) {
        return {
          success: true,
          bookingId: booking.id,
          bookingReference: booking.bookingReference,
          ticketId: ticket.id,
          ticketCode: ticket.ticketCode,
          paymentId: existingPayment.id,
          status: booking.status,
          message: "Idempotent payment retrieved successfully",
        };
      }
    }

    // 2. Lookup booking
    const booking = store.bookings.find((b) => b.id === bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.userId !== userId) {
      throw new Error("Unauthorized to complete payment for this booking");
    }

    if (booking.status === "CONFIRMED") {
      const ticket = store.tickets.find((t) => t.bookingId === booking.id);
      return {
        success: true,
        bookingId: booking.id,
        bookingReference: booking.bookingReference,
        ticketId: ticket?.id || "",
        ticketCode: ticket?.ticketCode || "",
        paymentId: "",
        status: "CONFIRMED",
        message: "Booking is already confirmed",
      };
    }

    if (booking.status !== "PENDING") {
      throw new Error(`Cannot pay for booking in status: ${booking.status}`);
    }

    // 3. Check expiration
    if (new Date(booking.expiresAt).getTime() < now.getTime()) {
      booking.status = "EXPIRED";
      await this.releaseExpiredHolds();
      throw new Error("Seat hold has expired. Please select your seats again.");
    }

    // 4. Verify seats are still held by this user
    const items = store.bookingItems.filter((bi) => bi.bookingId === booking.id);
    const itemSeatIds = items.map((bi) => bi.showtimeSeatId);

    const stSeats = store.showtimeSeats.filter((ss) => itemSeatIds.includes(ss.id));
    for (const ss of stSeats) {
      if (ss.status !== "HELD" || ss.heldByUserId !== userId) {
        throw new Error("One or more seats have been released or held by another session");
      }
    }

    // 5. Create Payment Record
    const paymentId = generateUuid();
    store.payments.push({
      id: paymentId,
      bookingId: booking.id,
      idempotencyKey,
      provider,
      providerPaymentId: `pay_test_${generateUuid().slice(0, 12)}`,
      amountCents: booking.totalAmountCents,
      currency: "usd",
      status: "COMPLETED",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });

    // 6. Update Booking status to CONFIRMED
    booking.status = "CONFIRMED";
    booking.updatedAt = now.toISOString();

    // 7. Update Seats status to BOOKED
    for (const ss of stSeats) {
      ss.status = "BOOKED";
      ss.heldUntil = null;
      ss.version += 1;
      ss.updatedAt = now.toISOString();
    }

    // 8. Generate Digital Ticket with QR Code payload
    const ticketId = generateUuid();
    const ticketCode = generateTicketCode();
    const showtime = await this.getShowtimeById(booking.showtimeId);
    const user = store.users.find((u) => u.id === userId);

    const qrPayload = JSON.stringify({
      cinebookPass: true,
      ticketCode,
      bookingRef: booking.bookingReference,
      movie: showtime?.movie?.title,
      cinema: showtime?.auditorium?.cinema?.name,
      auditorium: showtime?.auditorium?.name,
      time: showtime?.startTime,
      user: user?.email,
      seatsCount: items.length,
      seats: items.map((i) => i.seatLabel),
    });

    store.tickets.push({
      id: ticketId,
      bookingId: booking.id,
      ticketCode,
      qrCodeData: qrPayload,
      status: "ACTIVE",
      createdAt: now.toISOString(),
    });

    // 9. Audit Log
    store.auditLogs.push({
      id: generateUuid(),
      userId,
      action: "BOOKING_CONFIRMED",
      entityType: "booking",
      entityId: booking.id,
      metadata: {
        bookingReference: booking.bookingReference,
        ticketCode,
        amountCents: booking.totalAmountCents,
        idempotencyKey,
      },
      createdAt: now.toISOString(),
    });

    return {
      success: true,
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      ticketId,
      ticketCode,
      paymentId,
      status: "CONFIRMED",
      message: "Booking confirmed successfully! Your tickets are ready.",
    };
  },

  // --- CANCEL BOOKING & REFUND ---
  async cancelBooking(bookingId: string, userId: string, isAdmin: boolean = false) {
    const store = getStore();
    const now = new Date().toISOString();

    const booking = store.bookings.find((b) => b.id === bookingId);
    if (!booking) throw new Error("Booking not found");

    if (!isAdmin && booking.userId !== userId) {
      throw new Error("Unauthorized to cancel this booking");
    }

    if (booking.status !== "CONFIRMED") {
      throw new Error(`Cannot cancel booking with status: ${booking.status}`);
    }

    // 1. Mark booking as CANCELLED
    booking.status = "CANCELLED";
    booking.updatedAt = now;

    // 2. Mark payment as REFUNDED
    const payment = store.payments.find((p) => p.bookingId === booking.id);
    if (payment) {
      payment.status = "REFUNDED";
      payment.updatedAt = now;
    }

    // 3. Mark ticket as VOID
    const ticket = store.tickets.find((t) => t.bookingId === booking.id);
    if (ticket) {
      ticket.status = "VOID";
    }

    // 4. Release seats back to AVAILABLE
    const items = store.bookingItems.filter((bi) => bi.bookingId === booking.id);
    const itemSeatIds = items.map((bi) => bi.showtimeSeatId);

    const stSeats = store.showtimeSeats.filter((ss) => itemSeatIds.includes(ss.id));
    for (const ss of stSeats) {
      ss.status = "AVAILABLE";
      ss.heldByUserId = null;
      ss.heldUntil = null;
      ss.version += 1;
      ss.updatedAt = now;
    }

    // 5. Audit Log
    store.auditLogs.push({
      id: generateUuid(),
      userId,
      action: "BOOKING_CANCELLED_REFUNDED",
      entityType: "booking",
      entityId: booking.id,
      metadata: {
        bookingReference: booking.bookingReference,
        refundAmountCents: booking.totalAmountCents,
        seatsReleased: stSeats.length,
      },
      createdAt: now,
    });

    return {
      success: true,
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      status: "CANCELLED",
      refundAmountCents: booking.totalAmountCents,
      message: "Booking cancelled and full refund processed to payment method.",
    };
  },

  // --- RELEASE EXPIRED SEAT HOLDS ---
  async releaseExpiredHolds() {
    const store = getStore();
    const now = new Date();
    let releasedCount = 0;

    // 1. Release expired showtime_seats
    for (const ss of store.showtimeSeats) {
      if (ss.status === "HELD" && ss.heldUntil && new Date(ss.heldUntil).getTime() < now.getTime()) {
        ss.status = "AVAILABLE";
        ss.heldByUserId = null;
        ss.heldUntil = null;
        ss.version += 1;
        ss.updatedAt = now.toISOString();
        releasedCount++;
      }
    }

    // 2. Mark expired pending bookings
    for (const b of store.bookings) {
      if (b.status === "PENDING" && new Date(b.expiresAt).getTime() < now.getTime()) {
        b.status = "EXPIRED";
        b.updatedAt = now.toISOString();
      }
    }

    if (releasedCount > 0) {
      store.auditLogs.push({
        id: generateUuid(),
        userId: null,
        action: "EXPIRED_HOLDS_RELEASED",
        entityType: "showtime_seat",
        entityId: "cron",
        metadata: { releasedCount, timestamp: now.toISOString() },
        createdAt: now.toISOString(),
      });
    }

    return { releasedCount, timestamp: now.toISOString() };
  },

  // --- GET USER BOOKINGS ---
  async getUserBookings(userId: string): Promise<BookingWithDetails[]> {
    const store = getStore();
    const userBookings = store.bookings
      .filter((b) => b.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const result: BookingWithDetails[] = [];

    for (const b of userBookings) {
      const showtime = await this.getShowtimeById(b.showtimeId);
      const items = store.bookingItems.filter((bi) => bi.bookingId === b.id);
      const ticket = store.tickets.find((t) => t.bookingId === b.id);
      const payment = store.payments.find((p) => p.bookingId === b.id);

      result.push({
        id: b.id,
        bookingReference: b.bookingReference,
        userId: b.userId,
        showtimeId: b.showtimeId,
        status: b.status,
        totalAmountCents: b.totalAmountCents,
        feeCents: b.feeCents,
        taxCents: b.taxCents,
        expiresAt: b.expiresAt,
        createdAt: b.createdAt,
        movieTitle: showtime?.movie?.title || "Movie",
        moviePoster: showtime?.movie?.posterUrl || "",
        cinemaName: showtime?.auditorium?.cinema?.name || "Cinema",
        cinemaCity: showtime?.auditorium?.cinema?.city || "City",
        auditoriumName: showtime?.auditorium?.name || "Hall",
        screenType: showtime?.auditorium?.screenType || "STANDARD",
        showtimeStart: showtime?.startTime || b.createdAt,
        seats: items.map((i) => ({ seatLabel: i.seatLabel, priceCents: i.priceCents })),
        ticket: ticket
          ? {
              id: ticket.id,
              ticketCode: ticket.ticketCode,
              qrCodeData: ticket.qrCodeData,
              status: ticket.status,
            }
          : undefined,
        payment: payment
          ? {
              id: payment.id,
              amountCents: payment.amountCents,
              status: payment.status,
              provider: payment.provider,
            }
          : undefined,
      });
    }

    return result;
  },

  // --- GET SINGLE BOOKING DETAILS ---
  async getBookingById(bookingId: string): Promise<BookingWithDetails | null> {
    const store = getStore();
    const b = store.bookings.find((item) => item.id === bookingId || item.bookingReference === bookingId);
    if (!b) return null;

    const showtime = await this.getShowtimeById(b.showtimeId);
    const items = store.bookingItems.filter((bi) => bi.bookingId === b.id);
    const ticket = store.tickets.find((t) => t.bookingId === b.id);
    const payment = store.payments.find((p) => p.bookingId === b.id);

    return {
      id: b.id,
      bookingReference: b.bookingReference,
      userId: b.userId,
      showtimeId: b.showtimeId,
      status: b.status,
      totalAmountCents: b.totalAmountCents,
      feeCents: b.feeCents,
      taxCents: b.taxCents,
      expiresAt: b.expiresAt,
      createdAt: b.createdAt,
      movieTitle: showtime?.movie?.title || "Movie",
      moviePoster: showtime?.movie?.posterUrl || "",
      cinemaName: showtime?.auditorium?.cinema?.name || "Cinema",
      cinemaCity: showtime?.auditorium?.cinema?.city || "City",
      auditoriumName: showtime?.auditorium?.name || "Hall",
      screenType: showtime?.auditorium?.screenType || "STANDARD",
      showtimeStart: showtime?.startTime || b.createdAt,
      seats: items.map((i) => ({ seatLabel: i.seatLabel, priceCents: i.priceCents })),
      ticket: ticket
        ? {
            id: ticket.id,
            ticketCode: ticket.ticketCode,
            qrCodeData: ticket.qrCodeData,
            status: ticket.status,
          }
        : undefined,
      payment: payment
        ? {
            id: payment.id,
            amountCents: payment.amountCents,
            status: payment.status,
            provider: payment.provider,
          }
        : undefined,
    };
  },

  // --- ADMIN ANALYTICS & STATS ---
  async getAdminStats() {
    const store = getStore();
    const confirmedBookings = store.bookings.filter((b) => b.status === "CONFIRMED");
    const totalRevenueCents = confirmedBookings.reduce((sum, b) => sum + b.totalAmountCents, 0);
    const totalShowtimes = store.showtimes.length;
    const totalShowtimeSeats = store.showtimeSeats.length;
    const bookedSeats = store.showtimeSeats.filter((ss) => ss.status === "BOOKED").length;
    const occupancyRate = totalShowtimeSeats > 0 ? Math.round((bookedSeats / totalShowtimeSeats) * 100) : 0;

    const recentLogs = [...store.auditLogs]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20);

    const allBookings = await Promise.all(
      store.bookings
        .slice(-25)
        .reverse()
        .map((b) => this.getBookingById(b.id))
    );

    return {
      totalRevenueCents,
      totalBookings: confirmedBookings.length,
      activeMovies: store.movies.length,
      cinemasCount: store.cinemas.length,
      occupancyRate,
      recentLogs,
      recentBookings: allBookings.filter(Boolean),
    };
  },
};
