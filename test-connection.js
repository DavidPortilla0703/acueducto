import supabase from './config/database.js';

async function testConnection() {
  console.log('🔍 Probando conexión a Supabase...\n');

  try {
    // Test 1: Verificar conexión básica
    console.log('1️⃣ Verificando conexión...');
    const { data: testData, error: testError } = await supabase
      .from('usuario')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Error de conexión:', testError.message);
      console.error('\n🔧 Verifica:');
      console.error('   - SUPABASE_URL en .env');
      console.error('   - SUPABASE_ANON_KEY en .env');
      console.error('   - Que el proyecto de Supabase esté activo');
      return;
    }
    console.log('✅ Conexión exitosa a Supabase\n');

    // Test 2: Contar registros en tablas principales
    console.log('2️⃣ Contando registros en tablas principales...');
    
    const tablas = [
      'usuario',
      'propietario',
      'predio',
      'matricula',
      'mantenimiento',
      'solicitud_mantenimiento',
      'factura',
      'pago'
    ];

    for (const tabla of tablas) {
      const { count, error } = await supabase
        .from(tabla)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`   ⚠️  ${tabla}: Error - ${error.message}`);
      } else {
        console.log(`   ✅ ${tabla}: ${count} registros`);
      }
    }

    console.log('\n3️⃣ Probando consulta con JOIN...');
    const { data: predios, error: prediosError } = await supabase
      .from('predio')
      .select(`
        *,
        propietario:propietario!fk_predio_propietario (
          cc,
          nombre,
          apellido
        )
      `)
      .limit(1);

    if (prediosError) {
      console.log('   ⚠️  Error en JOIN:', prediosError.message);
    } else {
      console.log('   ✅ JOIN funcionando correctamente');
      if (predios && predios.length > 0) {
        console.log('   📄 Ejemplo de predio:');
        console.log(`      Dirección: ${predios[0].direccion}`);
        console.log(`      Propietario: ${predios[0].propietario?.nombre} ${predios[0].propietario?.apellido}`);
      }
    }

    console.log('\n4️⃣ Probando consulta compleja (Solicitudes)...');
    const { data: solicitudes, error: solicitudError } = await supabase
      .from('solicitud_mantenimiento')
      .select(`
        *,
        predio:predio!fk_solmant_predio (
          direccion
        ),
        mantenimiento:mantenimiento!fk_solmant_mantenimiento (
          nombre
        )
      `)
      .limit(1);

    if (solicitudError) {
      console.log('   ⚠️  Error:', solicitudError.message);
    } else {
      console.log('   ✅ Consulta compleja funcionando');
      if (solicitudes && solicitudes.length > 0) {
        console.log(`      Solicitud #${solicitudes[0].id} - ${solicitudes[0].estado}`);
      }
    }

    console.log('\n✅ Todas las pruebas completadas exitosamente!');
    console.log('\n📝 Notas:');
    console.log('   - Si ves errores de permisos, verifica RLS en Supabase');
    console.log('   - Las tablas deben existir en tu proyecto de Supabase');
    console.log('   - Verifica que las credenciales en .env sean correctas');

  } catch (error) {
    console.error('\n❌ Error general:', error.message);
    console.error('\n🔧 Soluciones posibles:');
    console.error('   1. Verifica SUPABASE_URL y SUPABASE_ANON_KEY en .env');
    console.error('   2. Asegúrate de que el proyecto de Supabase esté activo');
    console.error('   3. Verifica que las tablas existan en tu base de datos');
    console.error('   4. Revisa que RLS esté desactivado o configurado correctamente');
  }
}

testConnection();
