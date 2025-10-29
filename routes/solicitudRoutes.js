import express from 'express';
import supabase from '../config/database.js';

const router = express.Router();

// Obtener todas las solicitudes
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('solicitud_mantenimiento')
      .select(`
        *,
        predio:predio!fk_solmant_predio (
          id,
          direccion,
          telefono,
          correo,
          propietario:propietario!fk_predio_propietario (
            cc,
            nombre,
            apellido
          )
        ),
        mantenimiento:mantenimiento!fk_solmant_mantenimiento (
          id,
          nombre,
          descripcion
        )
      `)
      .order('id', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Error en GET /solicitudes:', error);
    res.status(500).json({ error: error.message, data: [] });
  }
});

// Obtener solicitud por ID
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('solicitud_mantenimiento')
      .select(`
        *,
        predio:predio!fk_solmant_predio (
          id,
          direccion,
          telefono,
          correo,
          propietario:propietario!fk_predio_propietario (
            cc,
            nombre,
            apellido,
            telefono,
            correo
          )
        ),
        mantenimiento:mantenimiento!fk_solmant_mantenimiento (
          id,
          nombre,
          descripcion,
          estado,
          fecha
        )
      `)
      .eq('id', req.params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Solicitud no encontrada' });
      }
      throw error;
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear solicitud
router.post('/', async (req, res) => {
  try {
    const { id_predio, id_mantenimiento, observaciones, prioridad } = req.body;
    
    // Verificar que el predio existe
    const { data: predio, error: predioError } = await supabase
      .from('predio')
      .select('id')
      .eq('id', id_predio)
      .single();
    
    if (predioError || !predio) {
      return res.status(404).json({ error: 'Predio no encontrado' });
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
        id_predio,
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

// Buscar solicitudes por predio
router.get('/predio/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
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
      .eq('id_predio', req.params.id)
      .order('id', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
