import { Database } from "lucide-react";

/**
 * Shown on the landing page of a fresh deployment before a database is
 * connected. Disappears once the database environment variables exist.
 */
export function SetupNotice() {
  return (
    <section
      aria-labelledby="setup-heading"
      className="mx-auto mt-8 max-w-6xl px-4 sm:px-6"
    >
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
        <h2 id="setup-heading" className="flex items-center gap-2 font-semibold">
          <Database className="size-5 shrink-0" aria-hidden />
          Almost there: connect a database
        </h2>
        <p className="mt-2 text-sm">
          The app is deployed, but it needs a database before anyone can sign up or try the demo.
        </p>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm">
          <li>
            In your Vercel project, open the <strong>Storage</strong> tab and choose{" "}
            <strong>Create Database</strong>, then <strong>Neon</strong>.
          </li>
          <li>Connect it to this project for all environments (keep the default settings).</li>
          <li>
            Open <strong>Deployments</strong> and <strong>Redeploy</strong> the latest deployment.
            Tables are created automatically.
          </li>
        </ol>
      </div>
    </section>
  );
}
