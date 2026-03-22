import Database from 'better-sqlite3';

const db = new Database('data.db');

const tables = [
  'notices', 'gallery', 'enquiries', 'faculty', 'about_sections', 
  'infrastructure', 'academic_streams', 'academic_levels', 
  'admission_steps', 'admission_documents', 'home_highlights', 
  'subscriptions', 'users'
];

console.log('Table Counts:');
tables.forEach(table => {
  try {
    const result = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get() as { count: number };
    console.log(`${table}: ${result.count}`);
  } catch {
    console.log(`${table}: Table not found or error`);
  }
});
