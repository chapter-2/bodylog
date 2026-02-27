import { getDb } from '../../utils/db';
import { requireAuth } from '../../utils/auth';

export default defineEventHandler((event) => {
    requireAuth(event);
    
    const db = getDb();
    const user = db.prepare('SELECT id, username, created_at FROM users WHERE id = ?').get(event.context.user_id);
    
    if (!user) {
        throw createError({ statusCode: 404, message: "User not found" });
    }

    return { user };
});
