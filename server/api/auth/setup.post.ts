import { getDb, initDb } from "../../utils/db";
import { hashPassword } from "../../utils/auth";
import { randomBytes } from "node:crypto";

export default defineEventHandler(async (event) => {
  await initDb();
  const db = getDb();

  const checkUser = await db.execute("SELECT COUNT(*) as count FROM users");
  if (Number(checkUser.rows[0].count) > 0) {
    throw createError({
      statusCode: 403,
      message: "App is already claimed. Setup is locked.",
    });
  }

  const body = await readBody(event);
  const { username, password } = body;

  if (!username || !password || username.length < 3 || password.length < 6) {
    throw createError({
      statusCode: 400,
      message: "Username min 3 chars, password min 6 chars",
    });
  }

  const hash = hashPassword(password);
  const result = await db.execute({
    sql: "INSERT INTO users (username, password_hash) VALUES (?, ?)",
    args: [username, hash],
  });

  const userId = Number(result.lastInsertRowid);

  const token = randomBytes(32).toString("hex");
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

  await db.execute({
    sql: "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)",
    args: [token, userId, expiresAt],
  });

  return { success: true, token, user: { id: userId, username } };
});
