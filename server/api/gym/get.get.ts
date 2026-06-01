export default defineEventHandler(async (event) => {
  await requireAuth(event);

  try {
    const db = getDb();
    const query = getQuery(event);
    const day = query.day as string | undefined;
    const userId = event.context.user_id;

    let result;
    if (day) {
      result = await db.execute({
        sql: "SELECT * FROM gym_sessions WHERE user_id = ? AND day = ? ORDER BY week ASC",
        args: [userId, day],
      });
    } else {
      result = await db.execute({
        sql: "SELECT * FROM gym_sessions WHERE user_id = ? ORDER BY week DESC",
        args: [userId],
      });
    }

    const data = result.rows.map((r: any) => [
      r.week.toString(),
      r.day,
      r.date,
      r.time ?? "",
      r.exercise_name,
      r.set1 ?? "-",
      r.set2 ?? "-",
      r.set3 ?? "-",
      r.set4 ?? "-",
      r.completed ?? "NO",
      r.notes ?? "",
      r.session_note ?? "",
    ]);

    return { data };
  } catch (error: any) {
    throw createError({ statusCode: 500, message: error.message });
  }
});
