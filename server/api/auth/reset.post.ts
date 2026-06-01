export default defineEventHandler(async (event) => {
  const { token, newPassword } = await readBody(event);

  if (!token || !newPassword || newPassword.length < 6) {
    throw createError({
      statusCode: 400,
      message: "Invalid request or password too short",
    });
  }

  const db = getDb();
  const resetRes = await db.execute({
    sql: "SELECT user_id, expires_at FROM password_resets WHERE token = ?",
    args: [token],
  });

  if (resetRes.rows.length === 0) {
    throw createError({ statusCode: 400, message: "Invalid or expired token" });
  }

  const { user_id, expires_at } = resetRes.rows[0];

  if (Date.now() > (expires_at as number)) {
    await db.execute({
      sql: "DELETE FROM password_resets WHERE token = ?",
      args: [token],
    });
    throw createError({ statusCode: 400, message: "Token has expired" });
  }

  const hashed = hashPassword(newPassword);

  await db.batch(
    [
      {
        sql: "UPDATE users SET password_hash = ? WHERE id = ?",
        args: [hashed, user_id],
      },
      { sql: "DELETE FROM sessions WHERE user_id = ?", args: [user_id] },
      { sql: "DELETE FROM password_resets WHERE token = ?", args: [token] },
    ],
    "write",
  );

  return {
    success: true,
    message: "Password reset successfully. Please login again.",
  };
});
