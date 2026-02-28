import { getDb } from '../../utils/db';
import { requireAuth } from '../../utils/auth';

export default defineEventHandler(async (event) => {
    // SECURITY FIX [BUG-08]: Mengamankan endpoint dari akses publik
    requireAuth(event);

    const body = await readBody(event);
    const { week, date, weight, notes } = body;

    if (!week || !date || weight === undefined) {
        throw createError({
            statusCode: 400,
            message: "Missing required fields (week, date, weight)",
        });
    }

    const db = getDb();

    try {
        db.prepare(`
            INSERT INTO bulk_entries (week, date, weight, notes)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(week) DO UPDATE SET
                date = excluded.date,
                weight = excluded.weight,
                notes = excluded.notes
        `).run(week, date, weight, notes || "");

        return { success: true };
    } catch (error: any) {
        console.error("Failed to save bulk entry:", error);
        throw createError({
            statusCode: 500,
            message: "Database error during save",
        });
    }
});
