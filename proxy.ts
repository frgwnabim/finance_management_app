import NextAuth from "next-auth";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";

import { authConfig } from "@/auth.config";
import { isDatabaseConfigured } from "@/lib/env";

// Next.js 16 renamed middleware.ts to proxy.ts.
// Access rules live in authConfig.callbacks.authorized.
const { auth } = NextAuth(authConfig);

// Auth.js's `auth` doubles as a proxy handler; its overloaded type doesn't
// describe being called directly, so narrow it to the proxy signature.
const authProxy = auth as unknown as (
  request: NextRequest,
  event: NextFetchEvent,
) => Promise<Response | undefined>;

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  // Until a database is connected there are no accounts (and no secret to
  // verify sessions): send visitors to the landing page, which explains setup.
  if (!isDatabaseConfigured()) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return authProxy(request, event);
}

export const config = {
  matcher: ["/app/:path*", "/login", "/register"],
};
