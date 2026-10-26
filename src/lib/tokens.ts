import { SignJWT, jwtVerify } from "jose";
import type { JWTPayload } from "jose";

export type UserRole = "USER" | "ADMIN";

export interface TokenPayload {
  userId: string;
  role: UserRole;
}

export const ACCESS_COOKIE_NAME = "access_token";
export const REFRESH_COOKIE_NAME = "refresh_token";

const encoder = new TextEncoder();

function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`);
  }
  return value;
}

function accessSecret(): Uint8Array {
  return encoder.encode(requireEnv(process.env.JWT_ACCESS_SECRET, "JWT_ACCESS_SECRET"));
}

function refreshSecret(): Uint8Array {
  return encoder.encode(requireEnv(process.env.JWT_REFRESH_SECRET, "JWT_REFRESH_SECRET"));
}

function isTokenPayload(payload: JWTPayload): payload is JWTPayload & TokenPayload {
  return (
    typeof payload.userId === "string" &&
    (payload["role"] === "USER" || payload["role"] === "ADMIN")
  );
}

async function sign(
  payload: TokenPayload,
  secret: Uint8Array,
  expiresIn: string,
): Promise<string> {
  return new SignJWT({ userId: payload.userId, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
}

async function verify(token: string, secret: Uint8Array): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    if (!isTokenPayload(payload)) {
      return null;
    }
    return { userId: payload.userId, role: payload.role };
  } catch {
    return null;
  }
}

export function signAccessToken(payload: TokenPayload): Promise<string> {
  return sign(payload, accessSecret(), process.env.ACCESS_TOKEN_EXPIRES_IN ?? "15m");
}

export function signRefreshToken(payload: TokenPayload): Promise<string> {
  return sign(payload, refreshSecret(), process.env.REFRESH_TOKEN_EXPIRES_IN ?? "7d");
}

export function verifyAccessToken(token: string): Promise<TokenPayload | null> {
  return verify(token, accessSecret());
}

export function verifyRefreshToken(token: string): Promise<TokenPayload | null> {
  return verify(token, refreshSecret());
}
