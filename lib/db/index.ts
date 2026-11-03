/**
 * Database client.
 *
 * See lib/auth.ts for why there is no `server-only` guard here: importing
 * `pg` from the browser already fails the build.
 */
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { DATABASE_URL } from "@/lib/env";
import * as schema from "./schema";

/**
 * A single pool is reused across hot reloads in development, where module
 * re-evaluation would otherwise open a new pool on every edit until Postgres
 * refuses further connections.
 */
const globalForDb = globalThis as unknown as { pool?: Pool };

const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false },
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

export const db = drizzle(pool, { schema });
