import { getDb, initDb } from "../../utils/db";

export default defineEventHandler(async () => {
  await initDb();

  const db = getDb();
  const result = await db.execute("SELECT COUNT(*) as count FROM users");

  return { isSetup: Number(result.rows[0].count) > 0 };
});
