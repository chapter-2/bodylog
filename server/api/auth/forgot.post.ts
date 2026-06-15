import { randomBytes } from "node:crypto";

export default defineEventHandler(async (event) => {
  const { username } = await readBody(event);

  if (!username) {
    throw createError({ statusCode: 400, message: "Username required" });
  }

  const db = getDb();
  const userRes = await db.execute({
    sql: "SELECT id FROM users WHERE username = ?",
    args: [username],
  });

  if (userRes.rows.length === 0) {
    return {
      success: true,
      message: "If the username exists, a reset link has been generated.",
    };
  }

  const userId = userRes.rows[0].id;
  const token = randomBytes(32).toString("hex");
  const expiresAt = Date.now() + 1000 * 60 * 60;

  await db.execute({
    sql: "INSERT INTO password_resets (token, user_id, expires_at) VALUES (?, ?, ?)",
    args: [token, userId, expiresAt],
  });

  const resetUrl = `${getRequestURL(event).origin}/reset-password?token=${token}`;

  console.log("\n=========================================");
  console.log(" PASSWORD RESET REQUESTED");
  console.log(` Username: ${username}`);
  console.log(` RESET URL: ${resetUrl}`);
  console.log("=========================================\n");

  return {
    success: true,
    message:
      "If the username exists, a reset link has been generated (check server logs).",
  };
});
