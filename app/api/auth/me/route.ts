import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, COOKIE_NAME } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const session = await verifySessionToken(token);
  if (!session) return NextResponse.json({ error: "Geçersiz oturum." }, { status: 401 });

  return NextResponse.json({ username: session.username });
}
