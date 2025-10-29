import express from 'express';
import supabase from '../config/database.js';

const router = express.Router();

// Obtener todos los pagos
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('pago')
      .select(`
        *,
        factura:factura!fk_pago_factura (
          id,
          cod_matricula,
          valor,
          estado
        )
      `)
      .order('fecha_pago', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener pagos por factura
router.get('/factura/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('pago')
      .select('*')
      .eq('id_factura', req.params.id)
      .order('fecha_pago', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
