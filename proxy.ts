import NextAuth from "next-auth";

import { authConfig } from "@/auth.config";

// Next.js 16 renamed middleware.ts to proxy.ts.
// Access rules live in authConfig.callbacks.authorized.
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: ["/app/:path*", "/login", "/register"],
};
