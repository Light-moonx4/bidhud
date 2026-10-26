import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ACCESS_COOKIE_NAME, verifyAccessToken } from "@/lib/tokens";
import type { TokenPayload } from "@/lib/tokens";

const PRIVATE_PREFIXES: readonly string[] = ["/dashboard", "/publish"];
const ADMIN_PREFIXES: readonly string[] = ["/admin"];
const AUTH_PAGES: readonly string[] = ["/login", "/register"];
const ADMIN_API_PREFIXES: readonly string[] = ["/api/moderation"];

function matchesPrefix(pathname: string, prefixes: readonly string[]): boolean {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

async function getSession(request: NextRequest): Promise<TokenPayload | null> {
  const token = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }
  return verifyAccessToken(token);
}

function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const session = await getSession(request);

  // API de moderación: respuestas JSON en lugar de redirecciones
  if (matchesPrefix(pathname, ADMIN_API_PREFIXES)) {
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }
    return NextResponse.next();
  }

  // Panel de administración: solo ADMIN
  if (matchesPrefix(pathname, ADMIN_PREFIXES)) {
    if (!session) {
      return redirectToLogin(request);
    }
    if (session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Rutas privadas: cualquier usuario autenticado
  if (matchesPrefix(pathname, PRIVATE_PREFIXES)) {
    if (!session) {
      return redirectToLogin(request);
    }
    return NextResponse.next();
  }

  // Login y registro: si ya hay sesión, redirige según rol
  if (matchesPrefix(pathname, AUTH_PAGES) && session) {
    const destination = session.role === "ADMIN" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/publish/:path*",
    "/admin/:path*",
    "/login",
    "/register",
    "/api/moderation/:path*",
  ],
};
