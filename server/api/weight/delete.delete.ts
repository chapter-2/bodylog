import { getDb } from "../../utils/db";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  await requireAuth(event);

  const body = await readBody(event);
  const { week } = body;

  if (week === undefined) {
    throw createError({
      statusCode: 400,
      message: "Missing required parameter: week",
    });
  }

  try {
    const db = getDb();
    await db.execute({
      sql: "DELETE FROM weight_entries WHERE week = ?",
      args: [week],
    });
    return { success: true };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: "Database error during delete",
    });
  }
});
