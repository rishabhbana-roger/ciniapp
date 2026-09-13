import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/cinebook";

// Check if we are using Neon Serverless HTTP or Node pg Pool
export function createDb() {
  const isNeon = connectionString.includes("neon.tech") || connectionString.includes("sslmode=require");

  if (isNeon && process.env.NODE_ENV === "production") {
    const sql = neon(connectionString);
    return drizzleNeon(sql, { schema });
  } else {
    const pool = new Pool({
      connectionString,
      ssl: connectionString.includes("sslmode=require") ? { rejectUnauthorized: false } : false,
      max: 10,
    });
    return drizzle(pool, { schema });
  }
}

export const db = createDb();
export * from "./schema";
