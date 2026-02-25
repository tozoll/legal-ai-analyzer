import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "lexai-default-secret-change-in-production"
);
const COOKIE_NAME = "lexai_session";
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

/**
 * Returns a base64-encoded bcrypt hash safe for storing in .env files
 * (avoids $ character interpolation issues with dotenv)
 */
export async function hashPassword(password: string): Promise<string> {
  const hash = await bcrypt.hash(password, 12);
  return Buffer.from(hash).toString("base64");
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(username: string): Promise<string> {
  return new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${COOKIE_MAX_AGE}s`)
    .sign(SECRET);
}

export async function verifySessionToken(token: string): Promise<{ username: string } | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return { username: payload.username as string };
  } catch {
    return null;
  }
}

export { COOKIE_NAME, COOKIE_MAX_AGE };
