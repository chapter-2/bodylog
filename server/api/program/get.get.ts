export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const mode = query.mode as string | undefined;

  if (!mode || !['gym', 'calist'].includes(mode)) {
    throw createError({ statusCode: 400, message: 'mode must be "gym" or "calist"' });
  }

  try {
    const db = getDb();

    const programRow = db
      .prepare('SELECT value FROM program_config WHERE key = ?')
      .get(`program_${mode}`) as { value: string } | undefined;

    const startDateRow = db
      .prepare('SELECT value FROM program_config WHERE key = ?')
      .get(`start_date_${mode}`) as { value: string } | undefined;

    return {
      config: programRow ? JSON.parse(programRow.value) : null,
      start_date: startDateRow ? startDateRow.value : null,
    };
  } catch (error: any) {
    throw createError({ statusCode: 500, message: error.message });
  }
});
