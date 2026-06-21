export default defineEventHandler(async (event) => {
  await requireAuth(event);

  try {
    const db = getDb();
    const query = getQuery(event);
    const exerciseType = query.exercise_type as string | undefined;
    const day = query.day as string | undefined;
    const userId = event.context.user_id;

    let sql = "SELECT * FROM workout_sessions WHERE user_id = ?";
    const args: any[] = [userId];

    if (exerciseType) {
      sql += " AND exercise_type = ?";
      args.push(exerciseType);
    }
    if (day) {
      sql += " AND day = ?";
      args.push(day);
    }
    sql += " ORDER BY week DESC";

    const result = await db.execute({ sql, args });

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
      r.exercise_type,
    ]);

    return { data };
  } catch (error: any) {
    throw createError({ statusCode: 500, message: error.message });
  }
});
