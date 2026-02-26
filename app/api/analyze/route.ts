import { NextRequest, NextResponse } from "next/server";
import { analyzeContract } from "@/lib/claude-legal";
import { appendLog, generateLogId } from "@/lib/logger";
import { saveUploadedFile } from "@/lib/storage";
import { verifySessionToken, COOKIE_NAME } from "@/lib/auth";

export const maxDuration = 120; // 2 minutes for long contracts

async function extractTextFromFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
    // Dynamic import to avoid build issues
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfModule = await import("pdf-parse") as any;
    const pdfParse = pdfModule.default ?? pdfModule;
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.name.endsWith(".docx")
  ) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (file.type === "text/plain" || file.name.endsWith(".txt")) {
    return buffer.toString("utf-8");
  }

  // Fallback: try to read as text
  return buffer.toString("utf-8");
}

export async function POST(request: NextRequest) {
  const logId = generateLogId();
  const timestamp = new Date().toISOString();

  // Resolve current user from session cookie
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;
  const username = session?.username ?? "anonim";

  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY environment variable is not set." },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    const allowedExtensions = [".pdf", ".docx", ".txt"];
    const hasValidType = allowedTypes.includes(file.type);
    const hasValidExt = allowedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!hasValidType && !hasValidExt) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload PDF, DOCX, or TXT files." },
        { status: 400 }
      );
    }

    // 20MB limit
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 20MB." },
        { status: 400 }
      );
    }

    // Archive the uploaded file
    let contractArchivePath: string | undefined;
    try {
      contractArchivePath = await saveUploadedFile(file, logId);
    } catch (archiveErr) {
      console.error("File archiving failed (non-fatal):", archiveErr);
    }

    const contractText = await extractTextFromFile(file);

    if (!contractText || contractText.trim().length < 100) {
      return NextResponse.json(
        { error: "Could not extract meaningful text from the file. Please ensure the document contains readable text." },
        { status: 400 }
      );
    }

    // Limit text to avoid token limits (approx 150k chars ~ 40k tokens)
    const truncatedText = contractText.length > 150000
      ? contractText.substring(0, 150000) + "\n\n[Document truncated for analysis]"
      : contractText;

    const partyName = formData.get("party") as string | null;
    const analysis = await analyzeContract(truncatedText, partyName ?? undefined);

    // Write success log
    appendLog({
      id: logId,
      username,
      filename: file.name,
      fileSize: file.size,
      party: partyName,
      timestamp,
      status: "success",
      contractArchivePath,
    });

    return NextResponse.json({ analysis, characterCount: contractText.length, party: partyName, logId });
  } catch (error) {
    console.error("Analysis error:", error);
    const message = error instanceof Error ? error.message : "Analysis failed";

    // Write error log
    try {
      appendLog({
        id: logId,
        username,
        filename: "bilinmiyor",
        fileSize: 0,
        party: null,
        timestamp,
        status: "error",
        errorMessage: message,
      });
    } catch (logErr) {
      console.error("Logging failed:", logErr);
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
