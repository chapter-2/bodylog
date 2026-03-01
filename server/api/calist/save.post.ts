import type { CalistSession } from "~/types";

export default defineEventHandler(async (event) => {
  requireAuth(event);

  try {
    const body = await readBody<CalistSession>(event);
    const db = getDb();

    const upsert = db.prepare(`
      INSERT INTO calist_sessions
        (week, day, date, time, exercise_name, set1, set2, set3, set4, completed, notes, session_note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(week, day, exercise_name) DO UPDATE SET
        date         = excluded.date,
        time         = excluded.time,
        set1         = excluded.set1,
        set2         = excluded.set2,
        set3         = excluded.set3,
        set4         = excluded.set4,
        completed    = excluded.completed,
        notes        = excluded.notes,
        session_note = excluded.session_note
    `);

    const saveAll = db.transaction(() => {
      for (const exercise of body.exercises) {
        const setsData = [...exercise.sets];
        while (setsData.length < 4) setsData.push("-");

        upsert.run(
          body.week,
          body.day,
          body.date,
          body.time ?? "",
          exercise.name,
          setsData[0],
          setsData[1],
          setsData[2],
          setsData[3],
          body.completed ? "YES" : "NO",
          exercise.note ?? "",
          body.sessionNote ?? "",
        );
      }
    });

    saveAll();

    return { success: true, message: "Calist session saved successfully" };
  } catch (error: any) {
    console.error("Failed to save calist session:", error);
    throw createError({
      statusCode: 500,
      message: `Failed to save: ${error.message}`,
    });
  }
});
