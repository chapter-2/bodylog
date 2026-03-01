import Database from "better-sqlite3";
import { join } from "node:path";
import { mkdirSync } from "node:fs";

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  const dbDir = process.env.DB_PATH ?? join(process.cwd(), "data");

  try {
    mkdirSync(dbDir, { recursive: true });
  } catch {}

  const dbFile = join(dbDir, "bodylog.db");
  _db = new Database(dbFile);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");

  initializeTables(_db);
  return _db;
}

function initializeTables(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      username      TEXT    NOT NULL UNIQUE,
      password_hash TEXT    NOT NULL,
      created_at    TEXT    DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token         TEXT    PRIMARY KEY,
      user_id       INTEGER NOT NULL,
      expires_at    INTEGER NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS weight_entries (
      id      INTEGER PRIMARY KEY AUTOINCREMENT,
      week    INTEGER NOT NULL UNIQUE,
      date    TEXT    NOT NULL,
      weight  REAL    NOT NULL,
      notes   TEXT    DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS gym_sessions (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      week          INTEGER NOT NULL,
      day           TEXT    NOT NULL,
      date          TEXT    NOT NULL,
      time          TEXT    DEFAULT '',
      exercise_name TEXT    NOT NULL,
      set1          TEXT    DEFAULT '-',
      set2          TEXT    DEFAULT '-',
      set3          TEXT    DEFAULT '-',
      set4          TEXT    DEFAULT '-',
      completed     TEXT    DEFAULT 'NO',
      notes         TEXT    DEFAULT '',
      session_note  TEXT    DEFAULT '',
      UNIQUE(week, day, exercise_name)
    );

    CREATE TABLE IF NOT EXISTS calist_sessions (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      week          INTEGER NOT NULL,
      day           TEXT    NOT NULL,
      date          TEXT    NOT NULL,
      time          TEXT    DEFAULT '',
      exercise_name TEXT    NOT NULL,
      set1          TEXT    DEFAULT '-',
      set2          TEXT    DEFAULT '-',
      set3          TEXT    DEFAULT '-',
      set4          TEXT    DEFAULT '-',
      completed     TEXT    DEFAULT 'NO',
      notes         TEXT    DEFAULT '',
      session_note  TEXT    DEFAULT '',
      UNIQUE(week, day, exercise_name)
    );

    CREATE TABLE IF NOT EXISTS program_config (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    -- NEW: Cardio Sessions Table
    CREATE TABLE IF NOT EXISTS cardio_sessions (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      week          INTEGER NOT NULL,
      day           TEXT    NOT NULL,
      date          TEXT    NOT NULL,
      type          TEXT    NOT NULL,
      duration_min  INTEGER DEFAULT 0,
      distance_km   REAL    DEFAULT 0,
      notes         TEXT    DEFAULT '',
      UNIQUE(week, day, type)
    );

    -- NEW: Custom Program Relational Tables (GAP-04)
    CREATE TABLE IF NOT EXISTS custom_programs (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL,
      name       TEXT    NOT NULL,
      created_at TEXT    DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS custom_days (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      program_id INTEGER NOT NULL,
      day_name   TEXT    NOT NULL,
      sort_order INTEGER NOT NULL,
      FOREIGN KEY(program_id) REFERENCES custom_programs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS custom_exercises (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      day_id        INTEGER NOT NULL,
      exercise_name TEXT    NOT NULL,
      target_sets   INTEGER DEFAULT 3,
      sort_order    INTEGER NOT NULL,
      FOREIGN KEY(day_id) REFERENCES custom_days(id) ON DELETE CASCADE
    );
  `);
}
