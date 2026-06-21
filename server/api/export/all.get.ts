import { requireAuth } from "../../utils/auth";
import { getDb } from "../../utils/db";

export default defineEventHandler(async (event) => {
  await requireAuth(event);

  try {
    const db = getDb();
    const gymSessions = await db.execute(
      "SELECT * FROM workout_sessions WHERE mode = 'gym' ORDER BY week ASC",
    );
    const calistSessions = await db.execute(
      "SELECT * FROM workout_sessions WHERE mode = 'calist' ORDER BY week ASC",
    );
    const weights = await db.execute(
      "SELECT * FROM weight_entries ORDER BY week ASC",
    );

    return {
      gym: gymSessions.rows,
      calist: calistSessions.rows,
      weight: weights.rows,
    };
  } catch (error: any) {
    throw createError({ statusCode: 500, message: error.message });
  }
});
