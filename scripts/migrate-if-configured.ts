// Build step on Vercel: applies migrations when a database is connected.
// Before one is connected (the very first deploy), it skips instead of
// failing, so the site still builds and shows setup instructions.
import { spawnSync } from "node:child_process";

import { getDirectDatabaseUrl } from "../lib/env";

if (!getDirectDatabaseUrl()) {
  console.log("No database connected yet: skipping migrations.");
  process.exit(0);
}

const result = spawnSync("npx", ["prisma", "migrate", "deploy"], { stdio: "inherit" });
process.exit(result.status ?? 1);
