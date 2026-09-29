import "dotenv/config";
import { defineConfig } from "prisma/config";

// The Prisma CLI (migrate, studio) uses the direct, non-pooled connection.
// The app runtime uses DATABASE_URL via the adapter in lib/prisma.ts.
// Read with process.env (not env()) so `prisma generate` works without it.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DIRECT_URL,
  },
});
