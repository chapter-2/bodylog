import { getDb } from "../../utils/db";
import { verifyPassword } from "../../utils/auth";
import { randomBytes } from "node:crypto";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username, password } = body;

  if (!username || !password) {
    throw createError({
      statusCode: 400,
      message: "Username and password required",
    });
  }

  const db = getDb();
  const user = db
    .prepare("SELECT id, username, password_hash FROM users WHERE username = ?")
    .get(username) as any;

  if (!user || !verifyPassword(password, user.password_hash)) {
    throw createError({ statusCode: 401, message: "Invalid credentials" });
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

  db.prepare(
    "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)",
  ).run(token, user.id, expiresAt);

  return {
    success: true,
    token,
    user: { id: user.id, username: user.username },
  };
});
