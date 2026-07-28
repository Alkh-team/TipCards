import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Creator-only route: /create requires a paid plan
    if (pathname.startsWith("/create")) {
      if (token?.plan === "FREE") {
        const url = req.nextUrl.clone();
        url.pathname = "/pricing";
        url.searchParams.set("upgrade", "1");
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Only run the middleware function for authenticated users on protected routes.
      // For unauthenticated users, next-auth will auto-redirect to /auth/login.
      authorized({ token }) {
        return !!token;
      },
    },
  }
);

// Which routes require authentication
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/create/:path*",
    "/settings/:path*",
    "/notifications/:path*",
  ],
};
