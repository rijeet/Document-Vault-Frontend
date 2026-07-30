import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that don't require a session
const PUBLIC_PATHS = ["/login"];

// Set as an httpOnly cookie by the backend on successful /auth/google login
// (see Part 3 — Auth). Middleware can still read httpOnly cookies because
// they arrive as plain request headers; only client-side JS is blocked.
const SESSION_COOKIE_NAME = "refreshToken";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  // No session, hitting a protected route → bounce to login, remember where they were going
  if (!hasSession && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Run on every route except static assets, images, and API routes
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};