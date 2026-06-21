import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  await requireAuth(event);

  try {
    const body = await readBody(event);
    const { mode, config } = body;

    if (!mode || !["gym", "calist", "cardio", "custom"].includes(mode)) {
      throw createError({
        statusCode: 400,
        message: 'mode must be "gym", "calist", "cardio", or "custom"',
      });
    }
    if (!config || typeof config !== "object") {
      throw createError({
        statusCode: 400,
        message: "config is required and must be an object",
      });
    }

    const db = getDb();
    await db.execute({
      sql: `INSERT INTO program_config (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      args: [`program_${mode}`, JSON.stringify(config)],
    });

    return { success: true };
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({ statusCode: 500, message: error.message });
  }
});
