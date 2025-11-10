import express from 'express';
import supabase from '../config/database.js';

const router = express.Router();

// Obtener todas las matrículas
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('matricula')
      .select(`
        *,
        predio:predio!fk_matricula_predio (
          id,
          direccion,
          telefono,
          correo,
          tipo,
          propietario:propietario!fk_predio_propietario (
            cc,
            nombre,
            apellido,
            telefono,
            correo
          )
        )
      `)
      .order('fecha', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener matrícula por código
router.get('/:codigo', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('matricula')
      .select(`
        *,
        predio:predio!fk_matricula_predio (
          id,
          direccion,
          telefono,
          correo,
          tipo,
          propietario:propietario!fk_predio_propietario (
            cc,
            nombre,
            apellido,
            telefono,
            correo
          )
        )
      `)
      .eq('cod_matricula', req.params.codigo)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Matrícula no encontrada' });
      }
      throw error;
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener matrículas por predio
router.get('/predio/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('matricula')
      .select('*')
      .eq('id_predio', req.params.id)
      .order('fecha', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear matrícula
router.post('/', async (req, res) => {
  try {
    const { cod_matricula, id_predio, estado } = req.body;
    
    // Verificar que el predio existe
    const { data: predio, error: predioError } = await supabase
      .from('predio')
      .select('id')
      .eq('id', id_predio)
      .single();
    
    if (predioError || !predio) {
      return res.status(404).json({ error: 'Predio no encontrado' });
    }
    
    // Verificar que no exista una matrícula con el mismo código
    const { data: matriculaExistente } = await supabase
      .from('matricula')
      .select('cod_matricula')
      .eq('cod_matricula', cod_matricula)
      .single();
    
    if (matriculaExistente) {
      return res.status(400).json({ error: 'Ya existe una matrícula con ese código' });
    }
    
    const { data, error } = await supabase
      .from('matricula')
      .insert([{
        cod_matricula,
        id_predio,
        estado: estado || 'Activa',
        fecha: new Date().toISOString().split('T')[0]
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ cod_matricula: data.cod_matricula, message: 'Matrícula creada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar matrícula completa
router.put('/:codigo', async (req, res) => {
  try {
    const { id_predio, estado } = req.body;

    // Verificar que la matrícula existe
    const { data: matriculaExistente, error: matriculaError } = await supabase
      .from('matricula')
      .select('cod_matricula')
      .eq('cod_matricula', req.params.codigo)
      .single();

    if (matriculaError || !matriculaExistente) {
      return res.status(404).json({ error: 'Matrícula no encontrada' });
    }

    // Verificar que el predio existe si se proporciona
    if (id_predio) {
      const { data: predio, error: predioError } = await supabase
        .from('predio')
        .select('id')
        .eq('id', id_predio)
        .single();

      if (predioError || !predio) {
        return res.status(404).json({ error: 'Predio no encontrado' });
      }
    }

    const { data, error } = await supabase
      .from('matricula')
      .update({ id_predio, estado })
      .eq('cod_matricula', req.params.codigo)
      .select();

    if (error) throw error;
    res.json({ message: 'Matrícula actualizada exitosamente', data: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar estado de matrícula
router.put('/:codigo/estado', async (req, res) => {
  try {
    const { estado } = req.body;
    const { data, error } = await supabase
      .from('matricula')
      .update({ estado })
      .eq('cod_matricula', req.params.codigo)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Matrícula no encontrada' });
    }
    res.json({ message: 'Estado de matrícula actualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar matrícula
router.delete('/:codigo', async (req, res) => {
  try {
    // Verificar que la matrícula existe
    const { data: matriculaExistente, error: matriculaError } = await supabase
      .from('matricula')
      .select('cod_matricula')
      .eq('cod_matricula', req.params.codigo)
      .single();

    if (matriculaError || !matriculaExistente) {
      return res.status(404).json({ error: 'Matrícula no encontrada' });
    }

    // Eliminar la matrícula
    const { error } = await supabase
      .from('matricula')
      .delete()
      .eq('cod_matricula', req.params.codigo);

    if (error) throw error;
    res.json({ message: 'Matrícula eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
