import dotenv from 'dotenv';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Iniciando actualización de valores de facturas...');
    
    const sqlPath = path.join(__dirname, 'update-all-facturas-valor.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await client.query(sql);
    
    console.log('✓ Valores actualizados correctamente');
    
  } catch (error) {
    console.error('Error al actualizar valores:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
