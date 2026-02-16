import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "data.db");
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,
    original_name TEXT NOT NULL,
    stored_name TEXT NOT NULL,
    size INTEGER NOT NULL,
    mime_type TEXT,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL
  )
`);

export interface FileRecord {
  id: string;
  original_name: string;
  stored_name: string;
  size: number;
  mime_type: string | null;
  created_at: number;
  expires_at: number;
}

const insertStmt = db.prepare(`
  INSERT INTO files (id, original_name, stored_name, size, mime_type, created_at, expires_at)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const getByIdStmt = db.prepare(`
  SELECT * FROM files WHERE id = ?
`);

const getExpiredStmt = db.prepare(`
  SELECT * FROM files WHERE expires_at <= ?
`);

const deleteByIdStmt = db.prepare(`
  DELETE FROM files WHERE id = ?
`);

const countStmt = db.prepare(`
  SELECT COUNT(*) as count FROM files
`);

export function insertFile(file: FileRecord): void {
  insertStmt.run(
    file.id,
    file.original_name,
    file.stored_name,
    file.size,
    file.mime_type,
    file.created_at,
    file.expires_at
  );
}

export function getFile(id: string): FileRecord | undefined {
  return getByIdStmt.get(id) as FileRecord | undefined;
}

export function getExpiredFiles(): FileRecord[] {
  const now = Math.floor(Date.now() / 1000);
  return getExpiredStmt.all(now) as FileRecord[];
}

export function deleteFile(id: string): void {
  deleteByIdStmt.run(id);
}

export function getFileCount(): number {
  return (countStmt.get() as { count: number }).count;
}

export function cleanupExpiredFiles(): number {
  const expired = getExpiredFiles();
  for (const file of expired) {
    const filePath = path.join(UPLOADS_DIR, file.stored_name);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch {
      console.error(`Failed to delete file: ${filePath}`);
    }
    deleteFile(file.id);
  }
  if (expired.length > 0) {
    console.log(`Cleaned up ${expired.length} expired file(s)`);
  }
  return expired.length;
}

export { UPLOADS_DIR };
