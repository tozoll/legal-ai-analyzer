import { NextRequest, NextResponse } from "next/server";
import { getAllUsers, createUser } from "@/lib/users";
import { verifySessionToken, COOKIE_NAME } from "@/lib/auth";

async function getSession(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

// GET /api/users — list all users (env admin + json users)
export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const jsonUsers = getAllUsers().map((u) => ({
    username: u.username,
    role: u.role,
    createdAt: u.createdAt,
    source: "db" as const,
  }));

  // Prepend the env admin
  const envAdmin = process.env.APP_USERNAME;
  const allUsers = [
    ...(envAdmin
      ? [{ username: envAdmin, role: "admin" as const, createdAt: null, source: "env" as const }]
      : []),
    ...jsonUsers,
  ];

  return NextResponse.json({ users: allUsers });
}

// POST /api/users — create new user
export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const body = await request.json();
  const { username, password, role } = body as {
    username: string;
    password: string;
    role?: "admin" | "user";
  };

  if (!username?.trim()) {
    return NextResponse.json({ error: "Kullanıcı adı boş olamaz." }, { status: 400 });
  }
  if (!password || password.length < 6) {
    return NextResponse.json(
      { error: "Şifre en az 6 karakter olmalıdır." },
      { status: 400 }
    );
  }
  if (!/^[a-zA-Z0-9_.-]+$/.test(username.trim())) {
    return NextResponse.json(
      { error: "Kullanıcı adı yalnızca harf, rakam, '_', '-' ve '.' içerebilir." },
      { status: 400 }
    );
  }

  const result = await createUser(username.trim(), password, role ?? "user");

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  return NextResponse.json({ success: true, username: username.trim() });
}
