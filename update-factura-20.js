/**
 * Script para actualizar la factura #20 con observaciones de mora y multas
 * 
 * Uso: node update-factura-20.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function actualizarFactura20() {
  console.log('🔧 Actualizando factura #20 con observaciones...\n');

  try {
    // Primero, obtener la factura actual
    const { data: factura, error: errorGet } = await supabase
      .from('factura')
      .select('*')
      .eq('id', 20)
      .single();

    if (errorGet) {
      console.error('❌ Error al obtener factura:', errorGet.message);
      return;
    }

    console.log('📄 Factura actual:');
    console.log(`   ID: ${factura.id}`);
    console.log(`   Matrícula: ${factura.cod_matricula}`);
    console.log(`   Valor: $${factura.valor}`);
    console.log(`   Estado: ${factura.estado}`);
    console.log(`   Observaciones actuales: ${factura.observaciones || 'NULL'}\n`);

    // Calcular el desglose (ejemplo basado en tu caso)
    // Asumiendo que la factura #20 tiene $500,000 y hay 2 facturas en mora
    const valor_base = 5000;
    const valor_mora = 550000; // $500,000 + $50,000
    const valor_multas = 10000; // 2 × $5,000
    const valor_total = valor_base + valor_mora + valor_multas; // $565,000

    const observaciones = `Incluye mora acumulada: $${valor_mora.toFixed(2)} + Multas: $${valor_multas.toFixed(2)} (2 factura(s) x $5,000). Detalle: 2025-10: $500000 + Multa: $5000, 2025-11: $50000 + Multa: $5000`;

    // Actualizar la factura
    const { error: errorUpdate } = await supabase
      .from('factura')
      .update({
        observaciones: observaciones,
        valor: valor_total // Actualizar también el valor total
      })
      .eq('id', 20);

    if (errorUpdate) {
      console.error('❌ Error al actualizar factura:', errorUpdate.message);
      return;
    }

    console.log('✅ Factura actualizada exitosamente!\n');
    console.log('📝 Nuevas observaciones:');
    console.log(`   ${observaciones}\n`);
    console.log(`💰 Nuevo valor total: $${valor_total.toLocaleString('es-CO')}\n`);

    // Verificar la actualización
    const { data: facturaActualizada } = await supabase
      .from('factura')
      .select('*')
      .eq('id', 20)
      .single();

    console.log('🔍 Verificación:');
    console.log(`   Observaciones: ${facturaActualizada.observaciones ? '✅ Sí' : '❌ No'}`);
    console.log(`   Valor: $${facturaActualizada.valor}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejecutar
actualizarFactura20();
