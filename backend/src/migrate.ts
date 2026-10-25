import fs from 'fs';
import path from 'path';
import { pool } from './db';

export async function runMigrations() {
  try {
    const migrationPath = path.resolve(__dirname, '../../schema_extension.sql');
    if (fs.existsSync(migrationPath)) {
      console.log('Running database schema extensions...');
      const sql = fs.readFileSync(migrationPath, 'utf8');
      await pool.query(sql);
      console.log('Database schema extensions applied successfully.');
    }
  } catch (err) {
    console.error('Migration warning (continuing if objects already exist):', err);
  }
}
