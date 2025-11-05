import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL y SUPABASE_ANON_KEY deben estar definidos');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSQLMigration() {
  try {
    console.log('🔄 Ejecutando migración SQL...');
    
    // Leer el archivo SQL
    const sqlFile = path.join(__dirname, 'add-fecha-solicitud.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('📄 SQL a ejecutar:');
    console.log(sql);
    console.log('\n⚠️  NOTA: Este script requiere permisos de administrador en Supabase.');
    console.log('📋 Por favor, ejecuta el SQL manualmente en el SQL Editor de Supabase:');
    console.log('   1. Ve a https://supabase.com/dashboard');
    console.log('   2. Selecciona tu proyecto');
    console.log('   3. Ve a SQL Editor');
    console.log('   4. Copia y pega el SQL mostrado arriba');
    console.log('   5. Ejecuta la consulta');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

runSQLMigration();
