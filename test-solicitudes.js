import pool from './config/database.js';

async function testSolicitudes() {
  try {
    console.log('🔍 Verificando solicitudes...\n');
    
    // Contar solicitudes
    const [count] = await pool.query('SELECT COUNT(*) as total FROM solicitud_mantenimiento');
    console.log('Total solicitudes:', count[0].total);
    
    if (count[0].total === 0) {
      console.log('\n⚠️  No hay solicitudes en la base de datos');
      console.log('Ejecuta el seed.sql para insertar datos de prueba');
      await pool.end();
      return;
    }
    
    // Verificar estructura
    console.log('\n📋 Verificando estructura de solicitudes...');
    const [solicitudes] = await pool.query('SELECT * FROM solicitud_mantenimiento LIMIT 1');
    console.log('Columnas:', Object.keys(solicitudes[0]));
    console.log('Primera solicitud:', solicitudes[0]);
    
    // Probar el query completo
    console.log('\n🔄 Probando query completo...');
    const [rows] = await pool.query(`
      SELECT s.*, m.numero_matricula, p.direccion, 
             u.nombre as nombre_propietario, u.apellido as apellido_propietario,
             t.nombre as tipo_nombre
      FROM solicitud_mantenimiento s
      JOIN matricula m ON s.numero_matricula = m.numero_matricula
      JOIN predio p ON m.id_predio = p.id_predio
      JOIN usuario u ON m.cedula_propietario = u.cedula
      JOIN tipo_mantenimiento t ON s.id_tipo = t.id_tipo
      ORDER BY s.fecha_solicitud DESC
      LIMIT 1
    `);
    
    if (rows.length > 0) {
      console.log('✅ Query exitoso!');
      console.log('Resultado:', rows[0]);
    } else {
      console.log('⚠️  Query no devolvió resultados');
    }
    
    await pool.end();
    console.log('\n✅ Diagnóstico completado');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('SQL State:', error.sqlState);
    console.error('Error Code:', error.errno);
    await pool.end();
    process.exit(1);
  }
}

testSolicitudes();
