import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

export interface User {
  username: string;
  passwordHash: string; // base64-encoded bcrypt hash
  role: "admin" | "user";
  createdAt: string;
}

const DB_PATH = path.join(process.cwd(), "data", "users.json");

function readDB(): { users: User[] } {
  if (!fs.existsSync(DB_PATH)) {
    return { users: [] };
  }
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { users: [] };
  }
}

function writeDB(db: { users: User[] }): void {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

export function getAllUsers(): User[] {
  return readDB().users;
}

export function findUser(username: string): User | undefined {
  return readDB().users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );
}

export async function createUser(
  username: string,
  password: string,
  role: "admin" | "user" = "user"
): Promise<{ success: boolean; error?: string }> {
  const db = readDB();

  const exists = db.users.some(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );
  if (exists) return { success: false, error: "Bu kullanıcı adı zaten mevcut." };

  // Also check against .env admin
  const envAdmin = process.env.APP_USERNAME;
  if (envAdmin && envAdmin.toLowerCase() === username.toLowerCase()) {
    return { success: false, error: "Bu kullanıcı adı zaten mevcut." };
  }

  const hash = await bcrypt.hash(password, 12);
  const b64Hash = Buffer.from(hash).toString("base64");

  db.users.push({
    username,
    passwordHash: b64Hash,
    role,
    createdAt: new Date().toISOString(),
  });

  writeDB(db);
  return { success: true };
}

export function deleteUser(username: string): { success: boolean; error?: string } {
  // Cannot delete the env admin
  const envAdmin = process.env.APP_USERNAME;
  if (envAdmin && envAdmin.toLowerCase() === username.toLowerCase()) {
    return { success: false, error: "Sistem yöneticisi silinemez." };
  }

  const db = readDB();
  const index = db.users.findIndex(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );
  if (index === -1) return { success: false, error: "Kullanıcı bulunamadı." };

  db.users.splice(index, 1);
  writeDB(db);
  return { success: true };
}

export async function verifyUser(
  username: string,
  password: string
): Promise<boolean> {
  const user = findUser(username);
  if (!user) return false;

  const hash = Buffer.from(user.passwordHash, "base64").toString("utf-8");
  return bcrypt.compare(password, hash);
}
