import { requireAuth } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  requireAuth(event);

  try {
    const body = await readBody(event);
    const { mode, date } = body;

    if (!mode || !['gym', 'calist'].includes(mode)) {
      throw createError({ statusCode: 400, message: 'mode must be "gym" or "calist"' });
    }

    // Validate date — must be a parseable ISO date string (YYYY-MM-DD)
    const parsed = new Date(date);
    if (!date || isNaN(parsed.getTime())) {
      throw createError({ statusCode: 400, message: 'date must be a valid ISO date string (YYYY-MM-DD)' });
    }

    const db = getDb();
    db.prepare(`
      INSERT INTO program_config (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `).run(`start_date_${mode}`, date);

    return { success: true };
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({ statusCode: 500, message: error.message });
  }
});
