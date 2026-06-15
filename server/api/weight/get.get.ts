export default defineEventHandler(async () => {
  try {
    const db = getDb();
    const result = await db.execute(
      "SELECT week, date, weight, notes FROM weight_entries ORDER BY week ASC",
    );

    const header = ["Week", "Date", "Weight (kg)", "Notes"];
    const data = [
      header,
      ...result.rows.map((r: any) => [
        r.week.toString(),
        r.date,
        r.weight.toString(),
        r.notes ?? "",
      ]),
    ];

    return { data };
  } catch (error: any) {
    throw createError({ statusCode: 500, message: error.message });
  }
});
