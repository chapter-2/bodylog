export default defineEventHandler(async (event) => {
  try {
    const db = getDb();
    const query = getQuery(event);
    const day = query.day as string | undefined;

    type SessionRow = {
      week: number; day: string; date: string; time: string;
      exercise_name: string; set1: string; set2: string; set3: string; set4: string;
      completed: string; notes: string; session_note: string;
    };

    let rows: SessionRow[];

    if (day) {
      rows = db.prepare(
        'SELECT * FROM gym_sessions WHERE day = ? ORDER BY week ASC'
      ).all(day) as SessionRow[];
    } else {
      // Fetch all days — aggregate all training days, sorted desc for history display
      rows = db.prepare(
        'SELECT * FROM gym_sessions ORDER BY week DESC'
      ).all() as SessionRow[];
    }

    const data = rows.map(r => [
      r.week.toString(),
      r.day,
      r.date,
      r.time ?? '',
      r.exercise_name,
      r.set1 ?? '-',
      r.set2 ?? '-',
      r.set3 ?? '-',
      r.set4 ?? '-',
      r.completed ?? 'NO',
      r.notes ?? '',
      r.session_note ?? '',
    ]);

    return { data };
  } catch (error: any) {
    console.error('Failed to get gym data:', error);
    throw createError({ statusCode: 500, message: error.message });
  }
});
