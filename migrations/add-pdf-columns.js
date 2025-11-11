import supabase from '../config/database.js';

async function addPdfColumns() {
  try {
    console.log('Agregando columnas para PDFs en la tabla factura...');

    // Ejecutar la migración SQL
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE factura 
        ADD COLUMN IF NOT EXISTS pdf_documento TEXT,
        ADD COLUMN IF NOT EXISTS pdf_nombre VARCHAR(255),
        ADD COLUMN IF NOT EXISTS pdf_tipo VARCHAR(100);
      `
    });

    if (error) {
      console.error('Error al ejecutar migración:', error);
      console.log('\nEjecuta manualmente este SQL en tu base de datos:');
      console.log(`
ALTER TABLE factura 
ADD COLUMN IF NOT EXISTS pdf_documento TEXT,
ADD COLUMN IF NOT EXISTS pdf_nombre VARCHAR(255),
ADD COLUMN IF NOT EXISTS pdf_tipo VARCHAR(100);
      `);
      process.exit(1);
    }

    console.log('✓ Columnas agregadas exitosamente');
    process.exit(0);

  } catch (error) {
    console.error('Error:', error.message);
    console.log('\nEjecuta manualmente este SQL en tu base de datos:');
    console.log(`
ALTER TABLE factura 
ADD COLUMN IF NOT EXISTS pdf_documento TEXT,
ADD COLUMN IF NOT EXISTS pdf_nombre VARCHAR(255),
ADD COLUMN IF NOT EXISTS pdf_tipo VARCHAR(100);
    `);
    process.exit(1);
  }
}

addPdfColumns();
