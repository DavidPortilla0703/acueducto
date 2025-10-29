import express from 'express';
import supabase from '../config/database.js';

const router = express.Router();

// Obtener todos los predios con información del propietario
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('predio')
      .select(`
        *,
        propietario:propietario!fk_predio_propietario (
          cc,
          nombre,
          apellido,
          telefono,
          correo
        )
      `)
      .order('fecha_registro', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener predio por ID
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('predio')
      .select(`
        *,
        propietario:propietario!fk_predio_propietario (
          cc,
          nombre,
          apellido,
          telefono,
          correo
        )
      `)
      .eq('id', req.params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Predio no encontrado' });
      }
      throw error;
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar predios por dirección o propietario
router.get('/buscar/:termino', async (req, res) => {
  try {
    const termino = req.params.termino;
    const { data, error } = await supabase
      .from('predio')
      .select(`
        *,
        propietario:propietario!fk_predio_propietario (
          cc,
          nombre,
          apellido,
          telefono,
          correo
        )
      `)
      .or(`direccion.ilike.%${termino}%,propietario_cc.eq.${termino}`)
      .order('direccion', { ascending: true });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear predio
router.post('/', async (req, res) => {
  try {
    const { direccion, propietario_cc, telefono, correo, tipo } = req.body;
    
    // Verificar que el propietario existe
    if (propietario_cc) {
      const { data: propietario, error: propError } = await supabase
        .from('propietario')
        .select('cc')
        .eq('cc', propietario_cc)
        .single();
      
      if (propError || !propietario) {
        return res.status(404).json({ error: 'Propietario no encontrado' });
      }
    }
    
    const { data, error } = await supabase
      .from('predio')
      .insert([{ 
        direccion, 
        propietario_cc, 
        telefono, 
        correo, 
        tipo,
        fecha_registro: new Date().toISOString().split('T')[0]
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ id: data.id, message: 'Predio creado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar predio
router.put('/:id', async (req, res) => {
  try {
    const { direccion, propietario_cc, telefono, correo, tipo } = req.body;
    
    // Verificar que el propietario existe si se proporciona
    if (propietario_cc) {
      const { data: propietario, error: propError } = await supabase
        .from('propietario')
        .select('cc')
        .eq('cc', propietario_cc)
        .single();
      
      if (propError || !propietario) {
        return res.status(404).json({ error: 'Propietario no encontrado' });
      }
    }
    
    const { data, error } = await supabase
      .from('predio')
      .update({ direccion, propietario_cc, telefono, correo, tipo })
      .eq('id', req.params.id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Predio no encontrado' });
    }
    res.json({ message: 'Predio actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
