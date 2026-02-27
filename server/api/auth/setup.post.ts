import { getDb } from '../../utils/db';
import { hashPassword } from '../../utils/auth';
import { randomBytes } from 'node:crypto';

export default defineEventHandler(async (event) => {
    const db = getDb();
    
    const checkUser = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
    if (checkUser.count > 0) {
        throw createError({
            statusCode: 403,
            message: "App is already claimed. Setup is locked.",
        });
    }

    const body = await readBody(event);
    const { username, password } = body;
    
    if (!username || !password || username.length < 3 || password.length < 6) {
        throw createError({
            statusCode: 400,
            message: "Username min 3 chars, password min 6 chars",
        });
    }

    const hash = hashPassword(password);
    const result = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username, hash);
    const userId = result.lastInsertRowid;

    const token = randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    
    db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(token, userId, expiresAt);

    return { success: true, token, user: { id: userId, username } };
});
