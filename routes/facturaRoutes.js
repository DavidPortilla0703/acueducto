import express from 'express';
import supabase from '../config/database.js';

const router = express.Router();

// Obtener todas las facturas
router.get('/', async (req, res) => {
  try {
    const { estado } = req.query;
    
    let query = supabase
      .from('factura')
      .select(`
        *,
        matricula:matricula!fk_factura_matricula (
          cod_matricula,
          predio:predio!fk_matricula_predio (
            direccion,
            propietario:propietario!fk_predio_propietario (
              cc,
              nombre,
              apellido
            )
          )
        )
      `);
    
    if (estado) {
      query = query.eq('estado', estado);
    }
    
    query = query.order('fecha_creacion', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener factura por ID
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('factura')
      .select(`
        *,
        matricula:matricula!fk_factura_matricula (
          cod_matricula,
          predio:predio!fk_matricula_predio (
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
          )
        )
      `)
      .eq('id', req.params.id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Factura no encontrada' });
      }
      throw error;
    }
    
    // Obtener pagos de la factura
    const { data: pagos, error: pagosError } = await supabase
      .from('pago')
      .select('*')
      .eq('id_factura', req.params.id);
    
    if (pagosError) throw pagosError;
    
    res.json({ ...data, pagos: pagos || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener facturas por matrícula
router.get('/matricula/:codigo', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('factura')
      .select('*')
      .eq('cod_matricula', req.params.codigo)
      .order('fecha_creacion', { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear factura
router.post('/', async (req, res) => {
  try {
    const { cod_matricula, fecha_vencimiento, valor, url } = req.body;
    
    // Verificar que la matrícula existe
    const { data: matricula, error: matriculaError } = await supabase
      .from('matricula')
      .select('cod_matricula')
      .eq('cod_matricula', cod_matricula)
      .single();
    
    if (matriculaError || !matricula) {
      return res.status(404).json({ error: 'Matrícula no encontrada' });
    }
    
    const { data, error } = await supabase
      .from('factura')
      .insert([{
        cod_matricula,
        fecha_creacion: new Date().toISOString().split('T')[0],
        fecha_vencimiento,
        valor,
        estado: 'Pendiente',
        url
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ id: data.id, message: 'Factura creada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar estado de factura
router.put('/:id/estado', async (req, res) => {
  try {
    const { estado } = req.body;
    const { data, error } = await supabase
      .from('factura')
      .update({ estado })
      .eq('id', req.params.id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }
    res.json({ message: 'Estado de factura actualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Registrar pago
router.post('/:id/pago', async (req, res) => {
  try {
    const { fecha_pago, metodo_pago, valor } = req.body;
    
    // Verificar que la factura existe
    const { data: factura, error: facturaError } = await supabase
      .from('factura')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (facturaError || !factura) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }
    
    // Registrar pago
    const { error: pagoError } = await supabase
      .from('pago')
      .insert([{
        id_factura: req.params.id,
        fecha_pago: fecha_pago || new Date().toISOString().split('T')[0],
        metodo_pago,
        valor
      }]);
    
    if (pagoError) throw pagoError;
    
    // Obtener total pagado
    const { data: pagos, error: pagosError } = await supabase
      .from('pago')
      .select('valor')
      .eq('id_factura', req.params.id);
    
    if (pagosError) throw pagosError;
    
    const total_pagado = pagos.reduce((sum, p) => sum + parseFloat(p.valor), 0);
    
    // Actualizar estado si está completamente pagada
    if (total_pagado >= parseFloat(factura.valor)) {
      await supabase
        .from('factura')
        .update({ estado: 'Pagada' })
        .eq('id', req.params.id);
    }
    
    res.status(201).json({ message: 'Pago registrado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
