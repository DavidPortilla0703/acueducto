import express from 'express';
import supabase from '../config/database.js';

const router = express.Router();

// Obtener todos los propietarios
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('propietario')
      .select('*');

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener propietario por CC
router.get('/:cc', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('propietario')
      .select('*')
      .eq('cc', req.params.cc)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Propietario no encontrado' });
      }
      throw error;
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear propietario
router.post('/', async (req, res) => {
  try {
    const { cc, nombre, apellido, telefono, correo } = req.body;
    const { data, error } = await supabase
      .from('propietario')
      .insert([{ cc, nombre, apellido, telefono, correo }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ cc: data.cc, message: 'Propietario creado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar propietario
router.put('/:cc', async (req, res) => {
  try {
    const { nombre, apellido, telefono, correo } = req.body;
    const { data, error } = await supabase
      .from('propietario')
      .update({ nombre, apellido, telefono, correo })
      .eq('cc', req.params.cc)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Propietario no encontrado' });
    }
    res.json({ message: 'Propietario actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
