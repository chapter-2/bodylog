// ── DEPRECATED — BUG-01 FIX ──────────────────────────────────────────────────
// This endpoint was the old single-password auth flow.
// Auth now uses username + password stored in the `users` SQLite table.
// Use POST /api/auth/login instead.
// This file intentionally returns 410 Gone so nothing accidentally calls it.
export default defineEventHandler(async () => {
  throw createError({
    statusCode: 410,
    message: "This endpoint has been removed. Use POST /api/auth/login instead.",
  });
});
