import type { BulkEntry } from '~/types';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<BulkEntry>(event);
    const db = getDb();

    db.prepare(`
      INSERT INTO bulk_entries (week, date, weight, notes)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(week) DO UPDATE SET
        date   = excluded.date,
        weight = excluded.weight,
        notes  = excluded.notes
    `).run(
      body.week,
      body.date,
      body.weight,
      body.notes ?? '',
    );

    return { success: true, message: 'Weight saved successfully' };
  } catch (error: any) {
    console.error('Failed to save bulk entry:', error);
    throw createError({ statusCode: 500, message: `Failed to save: ${error.message}` });
  }
});
