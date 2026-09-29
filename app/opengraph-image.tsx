import { ImageResponse } from "next/og";

export const alt = "Finance Manager: track every rupiah";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Social preview for links to the site. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #ecfdf5 0%, #ffffff 55%, #f0f9ff 100%)",
          color: "#18181b",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: "#059669",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
              <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
            </svg>
          </div>
          <div style={{ fontSize: 40, fontWeight: 700 }}>Finance Manager</div>
        </div>
        <div style={{ marginTop: 48, fontSize: 72, fontWeight: 800, lineHeight: 1.1, maxWidth: 900 }}>
          Know where every rupiah goes.
        </div>
        <div style={{ marginTop: 28, fontSize: 30, color: "#52525b", maxWidth: 900 }}>
          Budgets, recurring bills, analytics and CSV import. Built with Next.js, Prisma and PostgreSQL.
        </div>
      </div>
    ),
    size,
  );
}
