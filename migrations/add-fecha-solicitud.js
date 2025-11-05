import dotenv from 'dotenv';
import supabase from '../config/database.js';

// Cargar variables de entorno
dotenv.config();

async function addFechaSolicitud() {
  try {
    console.log('🔄 Iniciando migración: agregar fecha_solicitud a solicitudes existentes...');

    // Obtener todas las solicitudes
    const { data: solicitudes, error: fetchError } = await supabase
      .from('solicitud_mantenimiento')
      .select('id, fecha_solicitud');

    if (fetchError) {
      console.error('❌ Error al obtener solicitudes:', fetchError);
      return;
    }

    console.log(`📊 Total de solicitudes encontradas: ${solicitudes.length}`);

    // Actualizar solo las que no tienen fecha_solicitud
    const sinFecha = solicitudes.filter(s => !s.fecha_solicitud);
    console.log(`📝 Solicitudes sin fecha: ${sinFecha.length}`);

    if (sinFecha.length === 0) {
      console.log('✅ Todas las solicitudes ya tienen fecha_solicitud');
      return;
    }

    // Actualizar cada solicitud sin fecha
    for (const solicitud of sinFecha) {
      const { error: updateError } = await supabase
        .from('solicitud_mantenimiento')
        .update({ fecha_solicitud: new Date().toISOString().split('T')[0] })
        .eq('id', solicitud.id);

      if (updateError) {
        console.error(`❌ Error al actualizar solicitud ${solicitud.id}:`, updateError);
      } else {
        console.log(`✅ Solicitud ${solicitud.id} actualizada`);
      }
    }

    console.log('✅ Migración completada exitosamente');
  } catch (error) {
    console.error('❌ Error en la migración:', error);
  }
}

// Ejecutar la migración
addFechaSolicitud();
