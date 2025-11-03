/**
 * Script de prueba para actualizar facturas en mora
 * 
 * IMPORTANTE: Asegúrate de que el servidor backend esté corriendo antes de ejecutar este script
 * 
 * Pasos:
 * 1. En una terminal: cd backend && npm run dev
 * 2. En otra terminal: cd backend && node test-actualizar-mora.js
 */

const BASE_URL = 'http://localhost:3001/api';

async function testActualizarMora() {
  console.log('🧪 Probando actualización de facturas en mora...\n');

  try {
    console.log('📅 Fecha actual:', new Date().toISOString().split('T')[0]);
    console.log(`🌐 URL del servidor: ${BASE_URL}`);
    console.log('\n⏳ Actualizando facturas vencidas...\n');

    const response = await fetch(`${BASE_URL}/facturas/actualizar-mora`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const resultado = await response.json();

    if (!response.ok) {
      console.error('❌ Error en la respuesta:', response.status);
      console.error(resultado);
      return;
    }

    console.log('✅ Actualización completada!\n');
    console.log('📊 Resultado:');
    console.log(`   - Mensaje: ${resultado.message}`);
    console.log(`   - Facturas actualizadas: ${resultado.facturas_actualizadas}`);
    
    if (resultado.ids && resultado.ids.length > 0) {
      console.log(`   - IDs actualizados: ${resultado.ids.join(', ')}`);
    }
    console.log('');

    // Verificar facturas en mora
    console.log('🔍 Verificando facturas en mora...\n');
    const verificacion = await fetch(`${BASE_URL}/facturas?estado=en_mora`);
    const facturasEnMora = await verificacion.json();

    console.log(`📄 Total de facturas en mora: ${facturasEnMora.length}`);
    
    if (facturasEnMora.length > 0) {
      console.log('\nFacturas en mora:');
      facturasEnMora.forEach((f, idx) => {
        console.log(`   ${idx + 1}. ID: ${f.id} | Matrícula: ${f.cod_matricula} | Vencimiento: ${f.fecha_vencimiento} | Valor: $${parseFloat(f.valor).toLocaleString()}`);
      });
    }

    // Verificar la factura específica ID 12
    console.log('\n🔍 Verificando factura ID 12...\n');
    const facturaResponse = await fetch(`${BASE_URL}/facturas/12`);
    
    if (facturaResponse.ok) {
      const factura12 = await facturaResponse.json();
      console.log('📋 Factura ID 12:');
      console.log(`   - Matrícula: ${factura12.cod_matricula}`);
      console.log(`   - Fecha creación: ${factura12.fecha_creacion}`);
      console.log(`   - Fecha vencimiento: ${factura12.fecha_vencimiento}`);
      console.log(`   - Valor: $${parseFloat(factura12.valor).toLocaleString()}`);
      console.log(`   - Estado: ${factura12.estado}`);
      
      if (factura12.estado === 'en_mora') {
        console.log('\n✅ ¡La factura 12 está correctamente en estado "en_mora"!');
      } else if (factura12.estado === 'Pendiente') {
        console.log('\n⚠️  La factura 12 sigue en estado "Pendiente"');
        console.log('   Esto puede deberse a que la fecha de vencimiento no es anterior a hoy');
      }
    } else {
      console.log('❌ No se pudo obtener la factura ID 12');
    }

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
    console.error('\n⚠️  POSIBLES CAUSAS:');
    console.error('   1. El servidor backend no está corriendo');
    console.error('   2. El servidor está en un puerto diferente');
    console.error('   3. Hay un problema de conexión\n');
    console.error('💡 SOLUCIÓN:');
    console.error('   1. Abre otra terminal');
    console.error('   2. Ejecuta: cd backend');
    console.error('   3. Ejecuta: npm run dev');
    console.error('   4. Espera a que el servidor inicie');
    console.error('   5. Vuelve a ejecutar este script\n');
  }
}

// Ejecutar prueba
testActualizarMora();
