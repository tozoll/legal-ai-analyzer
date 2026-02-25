import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, createSessionToken, COOKIE_NAME, COOKIE_MAX_AGE } from "@/lib/auth";
import { verifyUser } from "@/lib/users";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Kullanıcı adı ve şifre gerekli." }, { status: 400 });
    }

    const trimmedUsername = username.trim();
    let authenticated = false;
    let resolvedUsername = trimmedUsername;

    // ── 1. Check .env admin ──────────────────────────────────────────────────
    const envUsername = process.env.APP_USERNAME;
    const envPasswordHashRaw = process.env.APP_PASSWORD_HASH;

    if (envUsername && envPasswordHashRaw) {
      const usernameMatch =
        trimmedUsername.toLowerCase() === envUsername.trim().toLowerCase();

      if (usernameMatch) {
        const envPasswordHash = envPasswordHashRaw.startsWith("$")
          ? envPasswordHashRaw
          : Buffer.from(envPasswordHashRaw, "base64").toString("utf-8");

        const passwordMatch = await verifyPassword(password, envPasswordHash);
        if (passwordMatch) {
          authenticated = true;
          resolvedUsername = envUsername.trim();
        }
      }
    }

    // ── 2. Check JSON users (only if env check didn't match) ─────────────────
    if (!authenticated) {
      authenticated = await verifyUser(trimmedUsername, password);
      if (authenticated) resolvedUsername = trimmedUsername;
    }

    if (!authenticated) {
      // Deliberate small delay to prevent brute-force timing attacks
      await new Promise((r) => setTimeout(r, 500 + Math.random() * 300));
      return NextResponse.json({ error: "Kullanıcı adı veya şifre hatalı." }, { status: 401 });
    }

    const token = await createSessionToken(resolvedUsername);

    const response = NextResponse.json({ success: true, username: resolvedUsername });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Giriş başarısız. Lütfen tekrar deneyin." }, { status: 500 });
  }
}
