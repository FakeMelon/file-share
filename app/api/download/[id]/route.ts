import { NextRequest, NextResponse } from "next/server";
import { getFile, UPLOADS_DIR } from "@/lib/db";
import path from "path";
import { readFile } from "fs/promises";
import { existsSync } from "fs";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const file = getFile(params.id);

  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const now = Math.floor(Date.now() / 1000);
  if (file.expires_at <= now) {
    return NextResponse.json({ error: "File has expired" }, { status: 410 });
  }

  const filePath = path.join(UPLOADS_DIR, file.stored_name);
  if (!existsSync(filePath)) {
    return NextResponse.json({ error: "File not found on disk" }, { status: 404 });
  }

  const buffer = await readFile(filePath);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": file.mime_type || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(file.original_name)}"`,
      "Content-Length": String(file.size),
    },
  });
}
