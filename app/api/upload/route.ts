import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import path from "path";
import { writeFile } from "fs/promises";
import { insertFile, getFileCount, UPLOADS_DIR } from "@/lib/db";

const MAX_FILE_SIZE = (Number(process.env.MAX_FILE_SIZE_MB) || 100) * 1024 * 1024;
const MAX_FILES = Number(process.env.MAX_FILES) || 10;

export async function POST(request: NextRequest) {
  // Auth check
  const password = request.headers.get("x-upload-password");
  if (!process.env.UPLOAD_PASSWORD || password !== process.env.UPLOAD_PASSWORD) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const expiresIn = formData.get("expiresIn") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (getFileCount() >= MAX_FILES) {
    return NextResponse.json(
      { error: `Storage full. Maximum of ${MAX_FILES} files reached.` },
      { status: 507 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    const maxMB = Math.round(MAX_FILE_SIZE / 1024 / 1024);
    return NextResponse.json(
      { error: `File too large. Maximum size is ${maxMB}MB` },
      { status: 413 }
    );
  }

  // Calculate expiration
  const expirationMap: Record<string, number> = {
    "1h": 3600,
    "24h": 86400,
    "7d": 604800,
  };
  const ttl = expirationMap[expiresIn || "24h"] || 86400;
  const now = Math.floor(Date.now() / 1000);

  // Generate ID and store file
  const id = nanoid(10);
  const ext = path.extname(file.name);
  const storedName = `${id}${ext}`;
  const filePath = path.join(UPLOADS_DIR, storedName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  insertFile({
    id,
    original_name: file.name,
    stored_name: storedName,
    size: file.size,
    mime_type: file.type || null,
    created_at: now,
    expires_at: now + ttl,
  });

  const baseUrl = request.headers.get("x-forwarded-proto")
    ? `${request.headers.get("x-forwarded-proto")}://${request.headers.get("host")}`
    : new URL(request.url).origin;

  return NextResponse.json({
    id,
    url: `${baseUrl}/share/${id}`,
    expiresAt: now + ttl,
  });
}
