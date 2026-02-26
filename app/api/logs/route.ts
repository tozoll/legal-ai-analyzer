import { NextRequest, NextResponse } from "next/server";
import { getAllLogs, getLogsByUser } from "@/lib/logger";
import { verifySessionToken, COOKIE_NAME } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const session = await verifySessionToken(token);
  if (!session) return NextResponse.json({ error: "Geçersiz oturum." }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const filterUser = searchParams.get("user");

  // Determine if requester is admin (env admin or db admin role doesn't matter here — 
  // we check if they're the env admin or if they pass an explicit role check).
  // Simple approach: env admin username is always admin.
  const envAdmin = process.env.APP_USERNAME ?? "";
  const isAdmin = session.username.toLowerCase() === envAdmin.toLowerCase();

  let logs;
  if (isAdmin) {
    // Admin sees all logs, optionally filtered by user query param
    logs = filterUser ? getLogsByUser(filterUser) : getAllLogs();
  } else {
    // Regular users only see their own logs
    logs = getLogsByUser(session.username);
  }

  return NextResponse.json({ logs, isAdmin });
}
