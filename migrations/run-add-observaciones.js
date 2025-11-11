/**
 * Script para agregar la columna observaciones a la tabla factura
 * 
 * Uso: node migrations/run-add-observaciones.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function agregarColumnaObservaciones() {
  console.log('🔧 Agregando columna observaciones a la tabla factura...\n');

  try {
    // Ejecutar la migración SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Agregar columna observaciones si no existe
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'factura' 
            AND column_name = 'observaciones'
          ) THEN
            ALTER TABLE factura ADD COLUMN observaciones TEXT;
            RAISE NOTICE 'Columna observaciones agregada exitosamente';
          ELSE
            RAISE NOTICE 'La columna observaciones ya existe';
          END IF;
        END $$;
      `
    });

    if (error) {
      console.error('❌ Error al ejecutar migración:', error.message);
      console.log('\n💡 Intenta ejecutar este SQL directamente en Supabase SQL Editor:');
      console.log('\nALTER TABLE factura ADD COLUMN IF NOT EXISTS observaciones TEXT;\n');
      return;
    }

    console.log('✅ Migración ejecutada exitosamente!\n');

    // Verificar que la columna existe
    const { data: columns, error: errorCheck } = await supabase
      .from('factura')
      .select('observaciones')
      .limit(1);

    if (errorCheck) {
      console.log('⚠️  No se pudo verificar la columna, pero puede que se haya creado.');
      console.log('   Verifica manualmente en Supabase.\n');
    } else {
      console.log('✅ Columna observaciones verificada!\n');
    }

    console.log('📝 Ahora puedes:');
    console.log('   1. Generar nuevas facturas con el botón "Generar Facturas Masivas"');
    console.log('   2. Las nuevas facturas tendrán observaciones automáticamente\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Ejecuta este SQL manualmente en Supabase:');
    console.log('\nALTER TABLE factura ADD COLUMN IF NOT EXISTS observaciones TEXT;\n');
  }
}

// Ejecutar
agregarColumnaObservaciones();
