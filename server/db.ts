import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const isVercel = process.env.VERCEL === '1';
const dbPath = isVercel 
  ? path.join('/tmp', 'data.db') 
  : path.join(process.cwd(), 'data.db');

// Ensure data directory exists if needed, but here it's root or /tmp
let db: Database.Database;
try {
  db = new Database(dbPath);
  // WAL mode might fail on some serverless environments, so we use a fallback
  try {
    db.pragma('journal_mode = WAL');
  } catch (pragmaErr) {
    console.warn("[Database] Failed to set WAL mode, continuing with default:", pragmaErr);
  }
  console.log(`[Database] Connected to ${dbPath}`);
} catch (err) {
  console.error(`[Database] CRITICAL: Failed to connect to database at ${dbPath}:`, err);
  throw err;
}

// Initialize tables
console.log("[Database] Ensuring tables exist...");
try {
  db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'admin'
  );

  CREATE TABLE IF NOT EXISTS notices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    isImportant INTEGER DEFAULT 0,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    imageUrl TEXT NOT NULL,
    caption TEXT,
    category TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS enquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS faculty (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    qualification TEXT NOT NULL,
    photo TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS about_sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    iconName TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS infrastructure (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS academic_streams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    subjects TEXT NOT NULL, -- JSON array
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS academic_levels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    classes TEXT NOT NULL,
    focus TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS admission_steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    orderIndex INTEGER DEFAULT 0,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS admission_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS home_highlights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    iconName TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    createdAt TEXT NOT NULL
  );
`);
  console.log("[Database] Tables verified successfully.");
  
  // Auto-seed admin user if missing
  try {
    const adminEmail = 'admin@school.com';
    const existing = db.prepare("SELECT * FROM users WHERE email = ?").get(adminEmail);
    if (!existing) {
      const hashedPassword = bcrypt.hashSync('adminpassword', 10);
      db.prepare("INSERT INTO users (email, password, role) VALUES (?, ?, ?)").run(adminEmail, hashedPassword, 'admin');
      console.log("[Database] Default admin user created.");
    }
  } catch (seedErr) {
    console.error("[Database] Failed to auto-seed admin user:", seedErr);
  }
} catch (err) {
  console.error("[Database] CRITICAL: Failed to initialize tables:", err);
  throw err;
}

export default db;
