import fs from "fs";
import path from "path";

const ARCHIVE_DIR = path.join(process.cwd(), "data", "archive");
const CONTRACTS_DIR = path.join(ARCHIVE_DIR, "contracts");
const REPORTS_DIR = path.join(ARCHIVE_DIR, "reports");

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/**
 * Saves the uploaded contract file to data/archive/contracts/<logId>_<filename>
 * Returns the relative path (relative to process.cwd()) stored in the log entry.
 */
export async function saveUploadedFile(
  file: File,
  logId: string
): Promise<string> {
  ensureDir(CONTRACTS_DIR);

  // Sanitize filename to avoid path traversal
  const safeName = path.basename(file.name).replace(/[^a-zA-Z0-9._\-\u00C0-\u024F]/g, "_");
  const destFilename = `${logId}_${safeName}`;
  const destPath = path.join(CONTRACTS_DIR, destFilename);

  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(destPath, buffer);

  // Return relative path for storage in log
  return path.relative(process.cwd(), destPath).replace(/\\/g, "/");
}

/**
 * Saves a PDF report buffer to data/archive/reports/<logId>_report.pdf
 * Returns the relative path.
 */
export function saveReportFile(
  pdfBuffer: Buffer,
  logId: string,
  originalFilename: string
): string {
  ensureDir(REPORTS_DIR);
  const safeName = path.basename(originalFilename, path.extname(originalFilename))
    .replace(/[^a-zA-Z0-9._\-\u00C0-\u024F]/g, "_");
  const destFilename = `${logId}_${safeName}_report.pdf`;
  const destPath = path.join(REPORTS_DIR, destFilename);
  fs.writeFileSync(destPath, pdfBuffer);
  return path.relative(process.cwd(), destPath).replace(/\\/g, "/");
}

/** Returns absolute paths of all archived contract files */
export function listArchivedContracts(): string[] {
  ensureDir(CONTRACTS_DIR);
  return fs.readdirSync(CONTRACTS_DIR).map((f) => path.join(CONTRACTS_DIR, f));
}
