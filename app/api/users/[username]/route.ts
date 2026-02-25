import { NextRequest, NextResponse } from "next/server";
import { deleteUser } from "@/lib/users";
import { verifySessionToken, COOKIE_NAME } from "@/lib/auth";

async function getSession(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

// DELETE /api/users/[username]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const { username } = await params;

  // Prevent self-deletion
  if (session.username.toLowerCase() === username.toLowerCase()) {
    return NextResponse.json(
      { error: "Kendi hesabınızı silemezsiniz." },
      { status: 400 }
    );
  }

  const result = deleteUser(username);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
