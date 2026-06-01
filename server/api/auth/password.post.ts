import { getDb } from "../../utils/db";
import { requireAuth, hashPassword, verifyPassword } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  await requireAuth(event);
  const userId = event.context.user_id;

  const body = await readBody(event);
  const { oldPassword, newPassword } = body;

  if (!oldPassword || !newPassword || newPassword.length < 6) {
    throw createError({
      statusCode: 400,
      message: "Invalid password format or length (min 6 chars).",
    });
  }

  const db = getDb();
  const result = await db.execute({
    sql: "SELECT password_hash FROM users WHERE id = ?",
    args: [userId],
  });
  const user = result.rows[0] as any;

  if (!user || !verifyPassword(oldPassword, user.password_hash)) {
    throw createError({
      statusCode: 401,
      message: "Current password is incorrect.",
    });
  }

  const newHash = hashPassword(newPassword);
  await db.execute({
    sql: "UPDATE users SET password_hash = ? WHERE id = ?",
    args: [newHash, userId],
  });

  return { success: true, message: "Password updated successfully." };
});
