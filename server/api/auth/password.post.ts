import { getDb } from "../../utils/db";
import { requireAuth, hashPassword, verifyPassword } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  requireAuth(event);
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
  const user = db
    .prepare("SELECT password_hash FROM users WHERE id = ?")
    .get(userId) as any;

  if (!user || !verifyPassword(oldPassword, user.password_hash)) {
    throw createError({
      statusCode: 401,
      message: "Current password is incorrect.",
    });
  }

  const newHash = hashPassword(newPassword);
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(
    newHash,
    userId,
  );

  return { success: true, message: "Password updated successfully." };
});
