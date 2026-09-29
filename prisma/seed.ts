// Seeds (or re-seeds) the demo account. Run with `npm run db:seed`.
// Safe to run repeatedly: it replaces only the demo user's data.
import { DEMO_EMAIL, resetDemoData } from "@/lib/demo";
import { prisma } from "@/lib/prisma";

async function main() {
  const { transactions } = await resetDemoData();
  console.log(`Seeded demo account ${DEMO_EMAIL} with ${transactions} transactions.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
