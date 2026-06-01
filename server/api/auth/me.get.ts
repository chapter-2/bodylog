import { getDb } from "../../utils/db";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  await requireAuth(event);

  const db = getDb();
  const result = await db.execute({
    sql: "SELECT id, username, created_at FROM users WHERE id = ?",
    args: [event.context.user_id],
  });
  const user = result.rows[0];

  if (!user) {
    throw createError({ statusCode: 404, message: "User not found" });
  }

  return { user };
});
