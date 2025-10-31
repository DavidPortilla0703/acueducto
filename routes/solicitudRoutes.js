import express from 'express';
import supabase from '../config/database.js';

const router = express.Router();

// Obtener todas las solicitudes
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('solicitud_mantenimiento')
      .select('*')
      .order('id', { ascending: false });

    if (error) throw error;

    // Enriquecer con información relacionada
    if (data && data.length > 0) {
      const enrichedData = await Promise.all(
        data.map(async (solicitud) => {
          // Obtener matrícula
          const { data: matricula } = await supabase
            .from('matricula')
            .select('cod_matricula, id_predio, estado')
            .eq('cod_matricula', solicitud.cod_matricula)
            .single();

          // Obtener predio a través de la matrícula
          let predio = null;
          let propietario = null;
          if (matricula?.id_predio) {
            const { data: predioData } = await supabase
              .from('predio')
              .select('id, direccion, telefono, correo, propietario_cc')
              .eq('id', matricula.id_predio)
              .single();
            predio = predioData;

            // Obtener propietario si existe
            if (predio?.propietario_cc) {
              const { data: prop } = await supabase
                .from('propietario')
                .select('cc, nombre, apellido, telefono, correo')
                .eq('cc', predio.propietario_cc)
                .single();
              propietario = prop;
            }
          }

          // Obtener mantenimiento
          const { data: mantenimiento } = await supabase
            .from('mantenimiento')
            .select('id, nombre, descripcion, estado, fecha')
            .eq('id', solicitud.id_mantenimiento)
            .single();

          return {
            ...solicitud,
            matricula,
            predio: predio ? { ...predio, propietario } : null,
            mantenimiento: mantenimiento || null,
          };
        })
      );
      res.json(enrichedData);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error en GET /solicitudes:', error);
    res.status(500).json({ error: error.message, data: [] });
  }
});

// Obtener solicitud por ID
router.get('/:id', async (req, res) => {
  try {
    const { data: solicitud, error } = await supabase
      .from('solicitud_mantenimiento')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Solicitud no encontrada' });
      }
      throw error;
    }

    // Obtener matrícula
    const { data: matricula } = await supabase
      .from('matricula')
      .select('cod_matricula, id_predio, estado, fecha')
      .eq('cod_matricula', solicitud.cod_matricula)
      .single();

    // Obtener predio
    let predio = null;
    let propietario = null;
    if (matricula?.id_predio) {
      const { data: predioData } = await supabase
        .from('predio')
        .select('id, direccion, telefono, correo, propietario_cc, tipo')
        .eq('id', matricula.id_predio)
        .single();
      predio = predioData;

      // Obtener propietario
      if (predio?.propietario_cc) {
        const { data: prop } = await supabase
          .from('propietario')
          .select('cc, nombre, apellido, telefono, correo')
          .eq('cc', predio.propietario_cc)
          .single();
        propietario = prop;
      }
    }

    // Obtener mantenimiento
    const { data: mantenimiento } = await supabase
      .from('mantenimiento')
      .select('id, nombre, descripcion, estado, fecha')
      .eq('id', solicitud.id_mantenimiento)
      .single();

    res.json({
      ...solicitud,
      matricula,
      predio: predio ? { ...predio, propietario } : null,
      mantenimiento: mantenimiento || null,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear solicitud
router.post('/', async (req, res) => {
  try {
    const { cod_matricula, id_mantenimiento, observaciones, prioridad } = req.body;
    
    // Verificar que la matrícula existe
    const { data: matricula, error: matriculaError } = await supabase
      .from('matricula')
      .select('cod_matricula')
      .eq('cod_matricula', cod_matricula)
      .single();
    
    if (matriculaError || !matricula) {
      return res.status(404).json({ error: 'Matrícula no encontrada' });
    }
    
    // Verificar que el mantenimiento existe
    const { data: mantenimiento, error: mantError } = await supabase
      .from('mantenimiento')
      .select('id')
      .eq('id', id_mantenimiento)
      .single();
    
    if (mantError || !mantenimiento) {
      return res.status(404).json({ error: 'Tipo de mantenimiento no encontrado' });
    }
    
    const { data, error } = await supabase
      .from('solicitud_mantenimiento')
      .insert([{
        cod_matricula,
        id_mantenimiento,
        estado: 'Pendiente',
        observaciones,
        prioridad: prioridad || 'Media'
      }])
      .select()
      .single();
    
    if (error) throw error;
    res.status(201).json({ id: data.id, message: 'Solicitud creada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar estado de solicitud
router.put('/:id/estado', async (req, res) => {
  try {
    const { estado } = req.body;
    const { data, error } = await supabase
      .from('solicitud_mantenimiento')
      .update({ estado })
      .eq('id', req.params.id)
      .select();
    
    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }
    res.json({ message: 'Estado actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar solicitudes por matrícula
router.get('/matricula/:cod_matricula', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('solicitud_mantenimiento')
      .select('*')
      .eq('cod_matricula', req.params.cod_matricula)
      .order('id', { ascending: false });

    if (error) throw error;

    // Enriquecer con información relacionada
    if (data && data.length > 0) {
      const enrichedData = await Promise.all(
        data.map(async (solicitud) => {
          const { data: mantenimiento } = await supabase
            .from('mantenimiento')
            .select('nombre, descripcion')
            .eq('id', solicitud.id_mantenimiento)
            .single();

          return {
            ...solicitud,
            mantenimiento,
          };
        })
      );
      res.json(enrichedData);
    } else {
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar solicitudes por predio (a través de matrícula)
router.get('/predio/:id_predio', async (req, res) => {
  try {
    // Primero obtener todas las matrículas del predio
    const { data: matriculas, error: matriculasError } = await supabase
      .from('matricula')
      .select('cod_matricula')
      .eq('id_predio', req.params.id_predio);

    if (matriculasError) throw matriculasError;

    if (!matriculas || matriculas.length === 0) {
      return res.json([]);
    }

    // Obtener solicitudes de todas las matrículas
    const codMatriculas = matriculas.map(m => m.cod_matricula);
    const { data, error } = await supabase
      .from('solicitud_mantenimiento')
      .select('*')
      .in('cod_matricula', codMatriculas)
      .order('id', { ascending: false });

    if (error) throw error;

    // Enriquecer con información relacionada
    if (data && data.length > 0) {
      const enrichedData = await Promise.all(
        data.map(async (solicitud) => {
          const { data: mantenimiento } = await supabase
            .from('mantenimiento')
            .select('nombre, descripcion')
            .eq('id', solicitud.id_mantenimiento)
            .single();

          return {
            ...solicitud,
            mantenimiento,
          };
        })
      );
      res.json(enrichedData);
    } else {
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar solicitud
router.delete('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('solicitud_mantenimiento')
      .delete()
      .eq('id', req.params.id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }
    res.json({ message: 'Solicitud eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
