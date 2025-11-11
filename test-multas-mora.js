/**
 * Script de prueba para verificar el sistema de multas por mora
 * 
 * Uso: node test-multas-mora.js
 */

const BASE_URL = 'http://localhost:3001/api';

async function testMultasMora() {
  console.log('🧪 Iniciando prueba de multas por mora...\n');

  try {
    // Datos de prueba
    const datosFacturacion = {
      periodo_facturacion: '2025-12',
      valor_base: 5000,
      dias_vencimiento: 15
    };

    console.log('📋 Datos de facturación:');
    console.log(JSON.stringify(datosFacturacion, null, 2));
    console.log('\n⏳ Generando facturas con multas...\n');

    const response = await fetch(`${BASE_URL}/facturas/generar-masivo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datosFacturacion)
    });

    const resultado = await response.json();

    if (!response.ok) {
      console.error('❌ Error en la respuesta:', response.status);
      console.error(resultado);
      return;
    }

    console.log('✅ Facturación completada exitosamente!\n');
    console.log('📊 Resumen:');
    console.log(`   - Total matrículas: ${resultado.total_matriculas}`);
    console.log(`   - Facturas creadas: ${resultado.facturas_creadas}`);
    console.log(`   - Errores: ${resultado.errores}\n`);

    if (resultado.detalle.exitosas.length > 0) {
      console.log('✅ Facturas exitosas:\n');
      
      // Mostrar todas las facturas con mora
      const facturasConMora = resultado.detalle.exitosas.filter(f => f.valor_mora > 0);
      
      if (facturasConMora.length > 0) {
        console.log('💰 Facturas con MORA y MULTAS:');
        facturasConMora.forEach((factura, idx) => {
          console.log(`\n   ${idx + 1}. Matrícula: ${factura.matricula}`);
          console.log(`      - ID Factura: ${factura.id_factura}`);
          console.log(`      - Valor Base: $${factura.valor_base.toLocaleString('es-CO')}`);
          console.log(`      - Mora Acumulada: $${factura.valor_mora.toLocaleString('es-CO')}`);
          console.log(`      - Multas: $${factura.valor_multas.toLocaleString('es-CO')} (${factura.facturas_en_mora} factura(s) × $5,000)`);
          console.log(`      - TOTAL: $${factura.valor_total.toLocaleString('es-CO')}`);
          console.log(`      - Facturas en mora: ${factura.facturas_en_mora}`);
        });
      }
      
      // Mostrar facturas sin mora
      const facturasSinMora = resultado.detalle.exitosas.filter(f => f.valor_mora === 0);
      
      if (facturasSinMora.length > 0) {
        console.log(`\n\n✨ Facturas SIN mora (${facturasSinMora.length}):`);
        facturasSinMora.slice(0, 3).forEach((factura, idx) => {
          console.log(`   ${idx + 1}. Matrícula: ${factura.matricula} - Total: $${factura.valor_total.toLocaleString('es-CO')}`);
        });
        if (facturasSinMora.length > 3) {
          console.log(`   ... y ${facturasSinMora.length - 3} más`);
        }
      }
    }

    if (resultado.detalle.fallidas.length > 0) {
      console.log('\n\n❌ Facturas con errores:');
      resultado.detalle.fallidas.forEach((error, idx) => {
        console.log(`   ${idx + 1}. Matrícula: ${error.matricula}`);
        console.log(`      - Error: ${error.error}`);
      });
    }

    // Verificar una factura específica con mora
    if (facturasConMora && facturasConMora.length > 0) {
      const primeraConMora = facturasConMora[0];
      console.log('\n\n🔍 Verificando factura con mora en la base de datos...');
      console.log(`   ID: ${primeraConMora.id_factura}`);
      
      const verificacion = await fetch(`${BASE_URL}/facturas/${primeraConMora.id_factura}`);
      const facturaDetalle = await verificacion.json();
      
      console.log('\n📄 Detalle de la factura:');
      console.log(`   - Matrícula: ${facturaDetalle.cod_matricula}`);
      console.log(`   - Periodo: ${facturaDetalle.periodo_facturacion}`);
      console.log(`   - Valor: $${parseFloat(facturaDetalle.valor).toLocaleString('es-CO')}`);
      console.log(`   - Estado: ${facturaDetalle.estado}`);
      console.log(`   - Observaciones: ${facturaDetalle.observaciones || 'N/A'}`);
    }

    console.log('\n\n✅ Prueba completada exitosamente!');
    console.log('\n📝 Resumen del sistema de multas:');
    console.log('   - Multa fija: $5,000 por cada factura en mora');
    console.log('   - Cálculo: Valor Base + Mora Acumulada + Multas');
    console.log('   - Ejemplo: $5,000 + $10,000 (mora) + $10,000 (2 × $5,000) = $25,000');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
  }
}

// Ejecutar prueba
testMultasMora();
