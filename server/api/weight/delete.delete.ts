import { getDb } from '../../utils/db';
import { requireAuth } from '../../utils/auth';

export default defineEventHandler(async (event) => {
    requireAuth(event);

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
        db.prepare('DELETE FROM weight_entries WHERE week = ?').run(week);

        return { success: true };
    } catch (error: any) {
        console.error("Failed to delete bulk entry:", error);
        throw createError({
            statusCode: 500,
            message: "Database error during delete",
        });
    }
});
