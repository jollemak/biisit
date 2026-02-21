const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

/**
 * Initialize and configure the database connection
 * Auto-detects production (/data) vs development (./) environments
 * Creates all required tables if they don't exist
 * @returns {Database} Configured database instance
 */
function initDatabase() {
  const DB_DIR = '/data';
  const DB_FILE = 'songs.db';
  let dbPath;

  if (fs.existsSync(DB_DIR)) {
    // Production: use /data directory
    dbPath = path.join(DB_DIR, DB_FILE);
  } else {
    // Development: use current directory
    dbPath = path.join(__dirname, '..', DB_FILE);
  }

  // Initialize database
  const db = new Database(dbPath);

  // Create songs table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS songs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      lyrics TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create setlists table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS setlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create setlist_songs junction table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS setlist_songs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      setlist_id INTEGER NOT NULL,
      song_id INTEGER NOT NULL,
      position INTEGER NOT NULL,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (setlist_id) REFERENCES setlists(id) ON DELETE CASCADE,
      FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
      UNIQUE(setlist_id, song_id)
    )
  `);

  console.log(`Database initialized at: ${dbPath}`);
  return db;
}

module.exports = { initDatabase };