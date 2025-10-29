import express from 'express';
import supabase from '../config/database.js';

const router = express.Router();

// Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('usuario')
      .select('*');

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener usuario por CC
router.get('/:cc', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('usuario')
      .select('*')
      .eq('cc', req.params.cc)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      throw error;
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear usuario
router.post('/', async (req, res) => {
  try {
    const { cc, nombre, apellido, telefono, correo } = req.body;
    const { data, error } = await supabase
      .from('usuario')
      .insert([{ 
        cc, 
        nombre, 
        apellido, 
        telefono, 
        correo,
        fecha_registro: new Date().toISOString().split('T')[0]
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ cc: data.cc, message: 'Usuario creado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar usuario
router.put('/:cc', async (req, res) => {
  try {
    const { nombre, apellido, telefono, correo } = req.body;
    const { data, error } = await supabase
      .from('usuario')
      .update({ nombre, apellido, telefono, correo })
      .eq('cc', req.params.cc)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
