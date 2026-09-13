import * as dotenv from "dotenv";
import { SEED_GENRES, SEED_MOVIES, SEED_CINEMAS, SEED_USERS } from "../lib/data/mock-seed-data";
import { getStore } from "./repository";

dotenv.config();

async function seed() {
  console.log("🎬 Starting CineBook Database Seeding...");

  try {
    const store = getStore();

    console.log(`✅ Loaded ${store.users.length} Users`);
    console.log(`✅ Loaded ${store.genres.length} Genres`);
    console.log(`✅ Loaded ${store.movies.length} Movies`);
    console.log(`✅ Loaded ${store.cinemas.length} Cinemas`);
    console.log(`✅ Loaded ${store.auditoriums.length} Auditoriums`);
    console.log(`✅ Generated ${store.seats.length} Auditorium Seats`);
    console.log(`✅ Scheduled ${store.showtimes.length} Showtimes`);
    console.log(`✅ Generated ${store.showtimeSeats.length} Showtime Seats with Atomic Locks`);

    console.log("\n🔑 Demo Test Accounts:");
    for (const u of SEED_USERS) {
      console.log(`   - [${u.role}] ${u.email} / ${u.passwordPlain}`);
    }

    console.log("\n🎉 CineBook Seed Data Ready for Production & Local Testing!");
  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
}

seed();
