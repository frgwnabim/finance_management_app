import { PrismaNeon } from "@prisma/adapter-neon";
import { getDatabaseUrl } from "@/lib/env";
import { PrismaClient } from "@/lib/generated/prisma/client";

function createPrismaClient() {
  // Connects lazily, so importing this module (e.g. during `next build`)
  // doesn't require a database. A missing URL fails on the first query.
  const adapter = new PrismaNeon({ connectionString: getDatabaseUrl() });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

// Reuse a single client across hot reloads in development so we don't
// exhaust database connections.
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
