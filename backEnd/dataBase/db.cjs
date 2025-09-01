const Database = require("better-sqlite3");
const db = new Database("database.sqlite");

// جدول یوزرها
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    bio TEXT,
    ppURL TEXT
  )
`).run();

// جدول پیام‌ها
db.prepare(`
  CREATE TABLE IF NOT EXISTS messages (
    sender TEXT NOT NULL,
    receiver TEXT NOT NULL,
    message TEXT NOT NULL,
    date INTEGER NOT NULL
  )
`).run();

module.exports = db;
