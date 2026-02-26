import fs from "fs";
import path from "path";

export interface LogEntry {
  id: string;
  username: string;
  filename: string;
  fileSize: number;
  party: string | null;
  timestamp: string; // ISO 8601
  status: "success" | "error";
  errorMessage?: string;
  contractArchivePath?: string; // relative path under data/archive/contracts/
}

const LOG_PATH = path.join(process.cwd(), "data", "logs.json");

function readLogs(): LogEntry[] {
  if (!fs.existsSync(LOG_PATH)) return [];
  try {
    const raw = fs.readFileSync(LOG_PATH, "utf-8");
    return JSON.parse(raw) as LogEntry[];
  } catch {
    return [];
  }
}

function writeLogs(logs: LogEntry[]): void {
  const dir = path.dirname(LOG_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(LOG_PATH, JSON.stringify(logs, null, 2), "utf-8");
}

export function appendLog(entry: LogEntry): void {
  const logs = readLogs();
  logs.push(entry);
  writeLogs(logs);
}

export function getAllLogs(): LogEntry[] {
  return readLogs().sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function getLogsByUser(username: string): LogEntry[] {
  return getAllLogs().filter(
    (l) => l.username.toLowerCase() === username.toLowerCase()
  );
}

/** Generates a unique log ID: timestamp + random suffix */
export function generateLogId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
