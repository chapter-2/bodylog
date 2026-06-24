import { requireAuth } from "../../utils/auth";
import { getDb } from "../../utils/db";

export default defineEventHandler(async (event) => {
  await requireAuth(event);

  try {
    const db = getDb();
    const userId = event.context.user_id;
    const gymSessions = await db.execute(
      "SELECT * FROM workout_sessions WHERE user_id = ? AND mode = 'gym' ORDER BY week ASC",
      [userId],
    );
    const calistSessions = await db.execute(
      "SELECT * FROM workout_sessions WHERE user_id = ? AND mode = 'calist' ORDER BY week ASC",
      [userId],
    );
    const weights = await db.execute(
      "SELECT * FROM weight_entries WHERE user_id = ? ORDER BY week ASC",
      [userId],
    );

    return {
      gym_sessions: gymSessions.rows,
      calist_sessions: calistSessions.rows,
      weight_entries: weights.rows,
    };
  } catch (error: any) {
    throw createError({ statusCode: 500, message: error.message });
  }
});
