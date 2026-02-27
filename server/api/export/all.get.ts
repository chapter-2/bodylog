import { requireAuth } from '../../utils/auth';

export default defineEventHandler((event) => {
  requireAuth(event);

  try {
    const db = getDb();

    const gymSessions = db.prepare(
      'SELECT week, day, date, time, exercise_name, set1, set2, set3, set4, completed, notes, session_note FROM gym_sessions ORDER BY week ASC, day ASC'
    ).all();

    const calistSessions = db.prepare(
      'SELECT week, day, date, time, exercise_name, set1, set2, set3, set4, completed, notes, session_note FROM calist_sessions ORDER BY week ASC, day ASC'
    ).all();

    const bulkEntries = db.prepare(
      'SELECT week, date, weight, notes FROM bulk_entries ORDER BY week ASC'
    ).all();

    return {
      exported_at: new Date().toISOString(),
      version: '1.0',
      gym_sessions: gymSessions,
      calist_sessions: calistSessions,
      bulk_entries: bulkEntries,
    };
  } catch (error: any) {
    throw createError({ statusCode: 500, message: error.message });
  }
});
