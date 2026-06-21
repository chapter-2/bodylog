export default defineEventHandler(async (event) => {
  await requireAuth(event);

  try {
    const body = await readBody(event);
    const userId = event.context.user_id;

    if (!body || !Array.isArray(body.exercises)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid payload: exercises must be an array",
      });
    }

    const db = getDb();

    const statements = body.exercises.map((exercise: any) => {
      let setsData: string[];

      if (exercise.type === "gym") {
        // sets are WorkoutSet[] — format as "weightkg × reps"
        setsData = exercise.sets.map((s: any) =>
          s.weight > 0 || s.reps > 0
            ? `${s.weight}kg × ${s.reps}`
            : "-",
        );
      } else {
        // calist/cardio/custom — sets are already string[], pass through
        setsData = [...exercise.sets];
      }

      while (setsData.length < 4) setsData.push("-");

      return {
        sql: `INSERT INTO workout_sessions (user_id, week, day, date, time, exercise_name, exercise_type, set1, set2, set3, set4, completed, notes, session_note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(user_id, week, day, exercise_type, exercise_name) DO UPDATE SET date = excluded.date, time = excluded.time, set1 = excluded.set1, set2 = excluded.set2, set3 = excluded.set3, set4 = excluded.set4, completed = excluded.completed, notes = excluded.notes, session_note = excluded.session_note`,
        args: [
          userId,
          body.week,
          body.day,
          body.date,
          body.time ?? "",
          exercise.name,
          exercise.type ?? "gym",
          setsData[0],
          setsData[1],
          setsData[2],
          setsData[3],
          body.completed ? "YES" : "NO",
          exercise.note ?? "",
          body.sessionNote ?? "",
        ],
      };
    });

    await db.batch(statements, "write");

    return { success: true, message: "Workout saved successfully" };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: `Failed to save: ${error.message}`,
    });
  }
});
