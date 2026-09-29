import { revalidatePath } from "next/cache";

/**
 * Transactions and categories feed totals, lists and forms on every page
 * under /app (and the layout loads categories for the Add Transaction form),
 * so mutations revalidate the whole /app layout.
 */
export function revalidateApp() {
  revalidatePath("/app", "layout");
}
