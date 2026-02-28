import { getDb } from '../../utils/db';
import { requireAuth } from '../../utils/auth';

export default defineEventHandler(async (event) => {
    requireAuth(event);

    const body = await readBody(event);
    const { week, date, weight, notes } = body;

    // 1. Validasi Keberadaan Data
    if (week === undefined || !date || weight === undefined) {
        throw createError({
            statusCode: 400,
            message: "Missing required fields (week, date, weight)",
        });
    }

    // 2. Validasi Batasan Angka (Sanity Check)
    if (typeof week !== 'number' || week < 1 || week > 1000) {
        throw createError({
            statusCode: 400,
            message: "Week must be between 1 and 1000.",
        });
    }

    if (typeof weight !== 'number' || weight < 20 || weight > 700) {
        throw createError({
            statusCode: 400,
            message: "Weight must be between 20kg and 700kg.",
        });
    }

    // 3. Batasan Panjang Karakter Notes (mencegah spam text panjang)
    const safeNotes = notes ? String(notes).substring(0, 150) : "";

    try {
        const db = getDb();
        const stmt = db.prepare(`
            INSERT INTO weight_entries (week, date, weight, notes)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(week) DO UPDATE SET
                date = excluded.date,
                weight = excluded.weight,
                notes = excluded.notes
        `);

        stmt.run(week, date, weight, safeNotes);

        return { success: true };
    } catch (error: any) {
        console.error("Failed to save weight entry:", error);
        throw createError({
            statusCode: 500,
            message: `Database error during save: ${error.message}`,
        });
    }
});
