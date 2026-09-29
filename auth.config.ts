import type { NextAuthConfig } from "next-auth";

// Edge-safe config shared by proxy.ts and auth.ts.
// Keep Prisma and bcrypt out of this file.
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;
      const isAppRoute = pathname === "/app" || pathname.startsWith("/app/");
      const isAuthRoute = pathname === "/login" || pathname === "/register";

      if (isAppRoute) {
        // Returning false redirects to pages.signIn with a callbackUrl.
        return isLoggedIn;
      }

      if (isAuthRoute && isLoggedIn) {
        return Response.redirect(new URL("/app", nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
