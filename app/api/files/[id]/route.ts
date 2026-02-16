import { NextRequest, NextResponse } from "next/server";
import { getFile } from "@/lib/db";

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

  return NextResponse.json({
    id: file.id,
    name: file.original_name,
    size: file.size,
    mimeType: file.mime_type,
    createdAt: file.created_at,
    expiresAt: file.expires_at,
  });
}
