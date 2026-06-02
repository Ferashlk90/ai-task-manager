import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifyToken, type SessionPayload } from "@/lib/auth/jwt";

const PUBLIC_PATHS = ["/login", "/setup"];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

// Build a per-request Content-Security-Policy. script-src is locked down with a
// nonce + 'strict-dynamic' (the real XSS defense); style-src allows inline
// because the app sets dynamic company colors via React style attributes, which
// a nonce cannot cover. Everything talks to our own origin only.
function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV === "development";
  return [
    `default-src 'self'`,
    // 'unsafe-eval' is only needed in dev (React uses eval for error stacks).
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' blob: data:`,
    `font-src 'self'`,
    `connect-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ].join("; ");
}

// Optimistic auth gate + CSP. Real authorization is re-checked in every
// Server Action / Route Handler via requireUser().
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifyToken<SessionPayload>(token);
  const onPublic = isPublic(pathname);

  // A fresh nonce per request; Next.js reads it from the CSP header and applies
  // it to its own scripts. The one hand-written inline script (theme init) gets
  // it explicitly in layout.tsx via the x-nonce header.
  const nonce = crypto.randomUUID().replace(/-/g, "");
  const csp = buildCsp(nonce);

  if (!session && !onPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const res = NextResponse.redirect(url);
    res.headers.set("Content-Security-Policy", csp);
    return res;
  }

  if (session && onPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    const res = NextResponse.redirect(url);
    res.headers.set("Content-Security-Policy", csp);
    return res;
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    // Exclude API, Next internals, and the public app icons / manifest so they
    // stay reachable without a session (needed for PWA install while logged out).
    "/((?!api|_next/static|_next/image|favicon.ico|icon|apple-icon|manifest.webmanifest|icons|sitemap.xml|robots.txt).*)",
  ],
};
