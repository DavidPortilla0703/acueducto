import pool from './config/database.js';

async function testConnection() {
  try {
    console.log('🔄 Probando conexión a la base de datos...');
    
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    console.log('✅ Conexión exitosa!');
    console.log('Resultado de prueba:', rows[0].result);
    
    // Verificar tablas
    const [tables] = await pool.query('SHOW TABLES');
    console.log('\n📋 Tablas disponibles:');
    tables.forEach(table => {
      console.log('  -', Object.values(table)[0]);
    });
    
    // Verificar configuración
    const [config] = await pool.query('SELECT * FROM configuracion_facturacion WHERE activo = 1 LIMIT 1');
    if (config.length > 0) {
      console.log('\n⚙️  Configuración activa:');
      console.log('  Acueducto:', config[0].nombre_acueducto);
      console.log('  Tarifa base:', config[0].tarifa_base);
      console.log('  Tarifa por m³:', config[0].tarifa_por_m3);
    }
    
    // Contar registros
    const [usuarios] = await pool.query('SELECT COUNT(*) as total FROM usuario');
    const [matriculas] = await pool.query('SELECT COUNT(*) as total FROM matricula');
    const [facturas] = await pool.query('SELECT COUNT(*) as total FROM factura');
    
    console.log('\n📊 Estadísticas:');
    console.log('  Usuarios:', usuarios[0].total);
    console.log('  Matrículas:', matriculas[0].total);
    console.log('  Facturas:', facturas[0].total);
    
    await pool.end();
    console.log('\n✅ Prueba completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testConnection();
