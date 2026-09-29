import type { MetadataRoute } from "next";

/** Only the public landing and auth pages should be indexed. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/app", "/api"] },
  };
}
