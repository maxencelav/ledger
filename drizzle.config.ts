import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// drizzle-kit runs outside Next, so it doesn't pick up .env.local on its own.
config({ path: ".env.local", quiet: true });

const DATABASE_URL = process.env.DATABASE_URL!;

export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dbCredentials: {
    url: DATABASE_URL,
    // The local container speaks plain TCP; managed providers require TLS.
    ssl: DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false },
  },
});
