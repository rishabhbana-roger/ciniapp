import { Movie, Cinema, Genre, Showtime, ShowtimeSeatDetail, SeatType, UserSession } from "./types";
import { SEED_GENRES, SEED_MOVIES, SEED_CINEMAS, SEED_USERS } from "./data/mock-seed-data";

// Helper to generate deterministic IDs
function slugToId(slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash << 5) - hash + slug.charCodeAt(i);
    hash |= 0;
  }
  return `mock-${Math.abs(hash).toString(16)}`;
}

// Generate formatted mock movies
export const MOCK_GENRES: Genre[] = SEED_GENRES.map((g, idx) => ({
  id: `genre-${idx + 1}`,
  name: g.name,
  slug: g.slug,
}));

export const MOCK_CINEMAS: Cinema[] = SEED_CINEMAS.map((c, cIdx) => {
  const cId = `cinema-${cIdx + 1}`;
  return {
    id: cId,
    name: c.name,
    city: c.city,
    address: c.address,
    phone: c.phone,
    imageUrl: c.imageUrl,
    amenities: c.amenities,
    auditoriums: c.auditoriums.map((a, aIdx) => ({
      id: `aud-${cIdx + 1}-${aIdx + 1}`,
      cinemaId: cId,
      name: a.name,
      screenType: a.screenType,
      totalSeats: a.totalRows * a.totalCols,
      totalRows: a.totalRows,
      totalCols: a.totalCols,
    })),
  };
});

// Generate showtimes for next 3 days
export const MOCK_MOVIES: Movie[] = SEED_MOVIES.map((m, mIdx) => {
  const mId = slugToId(m.slug);
  const movieGenres = m.genres.map((gName, gIdx) => ({
    id: `mg-${mIdx}-${gIdx}`,
    name: gName,
    slug: gName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  }));

  const showtimes: Showtime[] = [];
  const times = ["11:30", "14:15", "17:45", "20:30", "22:45"];
  
  // Create showtimes for today, tomorrow, day after
  for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    const dateStr = d.toISOString().split("T")[0];

    times.forEach((t, tIdx) => {
      const cinema = MOCK_CINEMAS[(mIdx + dayOffset) % MOCK_CINEMAS.length];
      const aud = cinema.auditoriums![tIdx % cinema.auditoriums!.length];
      const stId = `st-${m.slug}-${dateStr}-${t.replace(":", "")}`;
      
      showtimes.push({
        id: stId,
        movieId: mId,
        auditoriumId: aud.id,
        startTime: `${dateStr}T${t}:00.000Z`,
        endTime: `${dateStr}T${t}:00.000Z`,
        basePriceCents: aud.screenType === "IMAX" ? 2200 : aud.screenType === "DOLBY" ? 1900 : 1500,
        auditorium: {
          ...aud,
          cinema: cinema,
        },
      });
    });
  }

  return {
    id: mId,
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
    genres: movieGenres,
    showtimes: showtimes,
  };
});

// Create mock seat map for any showtime
export function getMockSeatMap(showtimeId: string): { showtime: Showtime; seatMap: ShowtimeSeatDetail[] } {
  let foundShowtime: Showtime | undefined;
  for (const m of MOCK_MOVIES) {
    const st = m.showtimes?.find((s) => s.id === showtimeId);
    if (st) {
      foundShowtime = { ...st, movie: m };
      break;
    }
  }

  if (!foundShowtime) {
    const defaultMovie = MOCK_MOVIES[0];
    foundShowtime = {
      id: showtimeId,
      movieId: defaultMovie.id,
      auditoriumId: MOCK_CINEMAS[0].auditoriums![0].id,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      basePriceCents: 1800,
      movie: defaultMovie,
      auditorium: {
        ...MOCK_CINEMAS[0].auditoriums![0],
        cinema: MOCK_CINEMAS[0],
      },
    };
  }

  const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const cols = 12;
  const seats: ShowtimeSeatDetail[] = [];

  // Read holds from local storage if in browser
  const holds = getStoredHolds();
  const bookedSeats = getStoredBookedSeatIds(showtimeId);

  rows.forEach((rowLetter, rIdx) => {
    for (let c = 1; c <= cols; c++) {
      const seatId = `${showtimeId}-${rowLetter}${c}`;
      let seatType: SeatType = "STANDARD";
      let priceCents = foundShowtime!.basePriceCents;

      if (rIdx === 0) {
        seatType = "ACCESSIBLE";
        priceCents = 1200;
      } else if (rIdx >= 1 && rIdx <= 4) {
        seatType = "STANDARD";
        priceCents = 1400;
      } else if (rIdx >= 5 && rIdx <= 6) {
        seatType = "PREMIUM";
        priceCents = 1800;
      } else {
        seatType = "VIP";
        priceCents = 2200;
      }

      const isHeld = holds.some((h) => h.showtimeId === showtimeId && h.seatIds.includes(seatId) && new Date(h.expiresAt) > new Date());
      const isBooked = bookedSeats.includes(seatId) || (rIdx === 2 && (c === 4 || c === 5)); // seed a couple booked

      seats.push({
        id: seatId,
        seatId: `seat-${rowLetter}${c}`,
        showtimeId: showtimeId,
        row: rowLetter,
        number: c,
        seatType: seatType,
        status: isBooked ? "BOOKED" : isHeld ? "HELD" : "AVAILABLE",
        priceCents: priceCents,
      });
    }
  });

  return { showtime: foundShowtime, seatMap: seats };
}

// LocalStorage helpers for browser mock mode
export function getStoredHolds(): Array<{ bookingId: string; showtimeId: string; seatIds: string[]; expiresAt: string }> {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("cinebook_mock_holds");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveHold(bookingId: string, showtimeId: string, seatIds: string[], expiresAt: string) {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredHolds().filter((h) => new Date(h.expiresAt) > new Date());
    current.push({ bookingId, showtimeId, seatIds, expiresAt });
    localStorage.setItem("cinebook_mock_holds", JSON.stringify(current));
  } catch {}
}

export function getStoredBookings(): any[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("cinebook_mock_bookings");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveBooking(booking: any) {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredBookings().filter((b) => b.id !== booking.id);
    current.unshift(booking);
    localStorage.setItem("cinebook_mock_bookings", JSON.stringify(current));
  } catch {}
}

export function getStoredBookedSeatIds(showtimeId: string): string[] {
  const bookings = getStoredBookings().filter((b) => b.showtimeId === showtimeId && b.status === "CONFIRMED");
  const bookedSeatIds: string[] = [];
  bookings.forEach((b) => {
    if (b.items) {
      b.items.forEach((item: any) => bookedSeatIds.push(item.seatId || item.id));
    }
  });
  return bookedSeatIds;
}

export function getStoredUser(): UserSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("cinebook_user_session");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStoredUser(user: UserSession | null) {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      localStorage.setItem("cinebook_user_session", JSON.stringify(user));
    } else {
      localStorage.removeItem("cinebook_user_session");
    }
  } catch {}
}
