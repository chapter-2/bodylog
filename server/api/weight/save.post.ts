import { getDb } from "../../utils/db";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  await requireAuth(event);

  const body = await readBody(event);
  const { week, date, weight, notes } = body;

  if (week === undefined || !date || weight === undefined) {
    throw createError({
      statusCode: 400,
      message: "Missing required fields (week, date, weight)",
    });
  }

  if (typeof week !== "number" || week < 1 || week > 1000) {
    throw createError({
      statusCode: 400,
      message: "Week must be between 1 and 1000.",
    });
  }

  if (typeof weight !== "number" || weight < 20 || weight > 700) {
    throw createError({
      statusCode: 400,
      message: "Weight must be between 20kg and 700kg.",
    });
  }

  const safeNotes = notes ? String(notes).substring(0, 150) : "";

  try {
    const db = getDb();
    await db.execute({
      sql: `INSERT INTO weight_entries (week, date, weight, notes) VALUES (?, ?, ?, ?) ON CONFLICT(week) DO UPDATE SET date = excluded.date, weight = excluded.weight, notes = excluded.notes`,
      args: [week, date, weight, safeNotes],
    });

    return { success: true };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: `Database error: ${error.message}`,
    });
  }
});
