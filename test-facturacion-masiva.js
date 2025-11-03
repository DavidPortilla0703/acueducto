/**
 * Script de prueba para la funcionalidad de facturación masiva
 * 
 * Uso: node test-facturacion-masiva.js
 */

const BASE_URL = 'http://localhost:3001/api';

async function testGenerarFacturasMasivo() {
  console.log('🧪 Iniciando prueba de facturación masiva...\n');

  try {
    // Datos de prueba
    const datosFacturacion = {
      periodo_facturacion: '2025-11',
      valor_base: 50000,
      dias_vencimiento: 15
    };

    console.log('📋 Datos de facturación:');
    console.log(JSON.stringify(datosFacturacion, null, 2));
    console.log('\n⏳ Generando facturas...\n');

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
    console.log(`   - Facturas creadas: ${resultado.facturas_creadas}`);
    console.log(`   - Errores: ${resultado.errores}`);
    console.log(`   - Mensaje: ${resultado.message}\n`);

    if (resultado.detalle.exitosas.length > 0) {
      console.log('✅ Facturas exitosas:');
      resultado.detalle.exitosas.forEach((factura, idx) => {
        console.log(`   ${idx + 1}. Matrícula: ${factura.matricula}`);
        console.log(`      - ID Factura: ${factura.id_factura}`);
        console.log(`      - Valor Base: $${factura.valor_base.toLocaleString()}`);
        console.log(`      - Valor Mora: $${factura.valor_mora.toLocaleString()}`);
        console.log(`      - Total: $${factura.valor_total.toLocaleString()}`);
      });
      console.log('');
    }

    if (resultado.detalle.fallidas.length > 0) {
      console.log('❌ Facturas con errores:');
      resultado.detalle.fallidas.forEach((error, idx) => {
        console.log(`   ${idx + 1}. Matrícula: ${error.matricula}`);
        console.log(`      - Error: ${error.error}`);
      });
      console.log('');
    }

    // Verificar facturas creadas
    console.log('🔍 Verificando facturas en la base de datos...\n');
    const verificacion = await fetch(`${BASE_URL}/facturas`);
    const facturas = await verificacion.json();
    
    const facturasDelPeriodo = facturas.filter(
      f => f.periodo_facturacion === datosFacturacion.periodo_facturacion
    );

    console.log(`📄 Total de facturas del periodo ${datosFacturacion.periodo_facturacion}: ${facturasDelPeriodo.length}`);
    
    if (facturasDelPeriodo.length > 0) {
      console.log('\nPrimeras 3 facturas:');
      facturasDelPeriodo.slice(0, 3).forEach((f, idx) => {
        console.log(`   ${idx + 1}. ID: ${f.id} | Matrícula: ${f.cod_matricula} | Valor: $${parseFloat(f.valor).toLocaleString()} | Estado: ${f.estado}`);
      });
    }

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
  }
}

// Ejecutar prueba
testGenerarFacturasMasivo();
