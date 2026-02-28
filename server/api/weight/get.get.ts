export default defineEventHandler(async () => {
  try {
    const db = getDb();

    const rows = db.prepare(
      'SELECT week, date, weight, notes FROM weight_entries ORDER BY week ASC'
    ).all() as { week: number; date: string; weight: number; notes: string }[];

    const header = ['Week', 'Date', 'Weight (kg)', 'Notes'];
    const data = [
      header,
      ...rows.map(r => [
        r.week.toString(),
        r.date,
        r.weight.toString(),
        r.notes ?? '',
      ]),
    ];

    return { data };
  } catch (error: any) {
    throw createError({ statusCode: 500, message: error.message });
  }
});
