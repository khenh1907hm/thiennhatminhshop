import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    const { pathname } = req.nextUrl;
    
    // Check if the route is an admin route
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
      // If the user is not an admin, redirect them to the home page or return 403
      if (req.nextauth.token?.role !== "ADMIN") {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
  },
  {
    callbacks: {
      // This ensures the middleware only runs if a token exists
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  // Protect all routes under /admin and /api/admin
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
