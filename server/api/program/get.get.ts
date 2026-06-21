export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const mode = query.mode as string | undefined;

  if (!mode || !["gym", "calist", "cardio", "custom"].includes(mode)) {
    throw createError({
      statusCode: 400,
      message: 'mode must be "gym", "calist", "cardio", or "custom"',
    });
  }

  try {
    const db = getDb();
    const programRow = await db.execute({
      sql: "SELECT value FROM program_config WHERE key = ?",
      args: [`program_${mode}`],
    });
    const startDateRow = await db.execute({
      sql: "SELECT value FROM program_config WHERE key = ?",
      args: [`start_date_${mode}`],
    });

    return {
      config: programRow.rows.length
        ? JSON.parse(programRow.rows[0].value as string)
        : null,
      start_date: startDateRow.rows.length ? startDateRow.rows[0].value : null,
    };
  } catch (error: any) {
    throw createError({ statusCode: 500, message: error.message });
  }
});
