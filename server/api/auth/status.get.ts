import { getDb } from "../../utils/db";

export default defineEventHandler((event) => {
  const db = getDb();
  const result = db.prepare("SELECT COUNT(*) as count FROM users").get() as any;

  return {
    isSetup: result.count > 0,
  };
});
