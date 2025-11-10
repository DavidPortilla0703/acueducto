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

    // Verificar que el propietario existe
    const { data: propietarioExistente, error: propietarioError } = await supabase
      .from('propietario')
      .select('cc')
      .eq('cc', req.params.cc)
      .single();

    if (propietarioError || !propietarioExistente) {
      return res.status(404).json({ error: 'Propietario no encontrado' });
    }

    const { data, error } = await supabase
      .from('propietario')
      .update({ nombre, apellido, telefono, correo })
      .eq('cc', req.params.cc)
      .select();

    if (error) throw error;
    res.json({ message: 'Propietario actualizado exitosamente', data: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar propietario
router.delete('/:cc', async (req, res) => {
  try {
    // Verificar que el propietario existe
    const { data: propietarioExistente, error: propietarioError } = await supabase
      .from('propietario')
      .select('cc')
      .eq('cc', req.params.cc)
      .single();

    if (propietarioError || !propietarioExistente) {
      return res.status(404).json({ error: 'Propietario no encontrado' });
    }

    // Verificar si tiene predios asociados
    const { data: predios } = await supabase
      .from('predio')
      .select('id')
      .eq('propietario_cc', req.params.cc);

    if (predios && predios.length > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el propietario porque tiene predios asociados',
        predios: predios.length
      });
    }

    // Eliminar el propietario
    const { error } = await supabase
      .from('propietario')
      .delete()
      .eq('cc', req.params.cc);

    if (error) throw error;
    res.json({ message: 'Propietario eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
