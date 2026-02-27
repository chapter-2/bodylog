export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const mode = query.mode as string | undefined;

  if (!mode || !['gym', 'calist'].includes(mode)) {
    throw createError({ statusCode: 400, message: 'mode must be "gym" or "calist"' });
  }

  try {
    const db = getDb();
    const row = db.prepare('SELECT value FROM program_config WHERE key = ?').get(`program_${mode}`) as { value: string } | undefined;

    return { config: row ? JSON.parse(row.value) : null };
  } catch (error: any) {
    throw createError({ statusCode: 500, message: error.message });
  }
});
