import { requireAuth } from "../../utils/auth";
import { getDb } from "../../utils/db";

export default defineEventHandler(async (event) => {
  await requireAuth(event);

  try {
    const db = getDb();
    const gymSessions = await db.execute(
      "SELECT * FROM workout_sessions WHERE exercise_type = 'gym' ORDER BY week ASC",
    );
    const calistSessions = await db.execute(
      "SELECT * FROM workout_sessions WHERE exercise_type = 'calist' ORDER BY week ASC",
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
