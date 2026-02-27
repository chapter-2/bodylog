import Database from 'better-sqlite3';
import { join } from 'node:path';
import { mkdirSync } from 'node:fs';

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  const dbDir = process.env.DB_PATH ?? join(process.cwd(), 'data');

  try {
    mkdirSync(dbDir, { recursive: true });
  } catch {}

  const dbFile = join(dbDir, 'bodylog.db');
  _db = new Database(dbFile);
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');

  initializeTables(_db);
  return _db;
}

function initializeTables(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS bulk_entries (
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
  `);
}
