const VALID_MODES = ['gym', 'calist', 'cardio', 'custom'];

export default defineEventHandler(async (event) => {
  await requireAuth(event);

  try {
    const db = getDb();
    const query = getQuery(event);
    const mode = query.mode as string | undefined;
    const day = query.day as string | undefined;
    const userId = event.context.user_id;

    if (mode && !VALID_MODES.includes(mode)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid mode: ${mode}. Must be one of ${VALID_MODES.join(', ')}`,
      });
    }

    let sql = "SELECT * FROM workout_sessions WHERE user_id = ?";
    const args: any[] = [userId];

    if (mode) {
      sql += " AND mode = ?";
      args.push(mode);
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
      r.mode,
    ]);

    return { data };
  } catch (error: any) {
    throw createError({ statusCode: 500, message: error.message });
  }
});
