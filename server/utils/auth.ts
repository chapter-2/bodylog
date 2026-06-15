import { getCookie, createError } from "h3";
import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
import { getDb } from "./db";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, hash: string): boolean {
  const [salt, key] = hash.split(":");
  const keyBuffer = Buffer.from(key, "hex");
  const derivedKey = scryptSync(password, salt, 64);
  return timingSafeEqual(keyBuffer, derivedKey);
}

export async function requireAuth(event: any) {
  const token = getCookie(event, "auth_token");
  if (!token) throw createError({ statusCode: 401, message: "Unauthorized" });

  const db = getDb();
  const result = await db.execute({
    sql: "SELECT user_id FROM sessions WHERE token = ? AND expires_at > ?",
    args: [token, Date.now()],
  });

  if (result.rows.length === 0) {
    throw createError({ statusCode: 401, message: "Session expired" });
  }

  event.context.user_id = result.rows[0].user_id;
}
