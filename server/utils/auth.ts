import { getCookie, createError } from 'h3';
import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';
import { getDb } from './db';

export function hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const hashBuffer = scryptSync(password, salt, 64);
    const keyBuffer = Buffer.from(key, 'hex');
    return timingSafeEqual(hashBuffer, keyBuffer);
}

export function requireAuth(event: any) {
    const token = getCookie(event, 'auth_token');
    
    if (!token) {
        throw createError({ statusCode: 401, message: 'Unauthorized' });
    }

    const db = getDb();
    const session = db.prepare('SELECT user_id, expires_at FROM sessions WHERE token = ?').get(token) as any;

    if (!session || session.expires_at < Date.now()) {
        if (session) {
            db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
        }
        throw createError({ statusCode: 401, message: 'Session expired' });
    }

    event.context.user_id = session.user_id;
}
