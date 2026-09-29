import "dotenv/config";
import { defineConfig } from "prisma/config";

import { getDirectDatabaseUrl } from "./lib/env";

// The Prisma CLI (migrate, seed, studio) uses the direct, non-pooled
// connection. The app runtime uses the pooled URL via lib/prisma.ts.
// Resolved lazily (undefined is fine), so `prisma generate` works without it.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: getDirectDatabaseUrl(),
  },
});
