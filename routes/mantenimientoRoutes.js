import express from 'express';
import supabase from '../config/database.js';

const router = express.Router();

// Obtener todos los mantenimientos
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('mantenimiento')
      .select('*')
      .order('fecha', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener mantenimiento por ID
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('mantenimiento')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Mantenimiento no encontrado' });
      }
      throw error;
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear mantenimiento
router.post('/', async (req, res) => {
  try {
    const { nombre, descripcion, estado } = req.body;
    const { data, error } = await supabase
      .from('mantenimiento')
      .insert([{ 
        nombre, 
        descripcion, 
        estado: estado || 'Pendiente',
        fecha: new Date().toISOString().split('T')[0]
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ id: data.id, message: 'Mantenimiento creado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar mantenimiento
router.put('/:id', async (req, res) => {
  try {
    const { nombre, descripcion, estado } = req.body;
    const { data, error } = await supabase
      .from('mantenimiento')
      .update({ nombre, descripcion, estado })
      .eq('id', req.params.id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Mantenimiento no encontrado' });
    }
    res.json({ message: 'Mantenimiento actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar mantenimiento
router.delete('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('mantenimiento')
      .delete()
      .eq('id', req.params.id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Mantenimiento no encontrado' });
    }
    res.json({ message: 'Mantenimiento eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
