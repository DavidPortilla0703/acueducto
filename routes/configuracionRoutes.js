import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Obtener configuración activa
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM configuracion_facturacion WHERE activo = 1 LIMIT 1'
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No hay configuración activa' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear o actualizar configuración
router.post('/', async (req, res) => {
  try {
    const {
      nombre_acueducto, logo_url, nit, direccion, telefono, email,
      tarifa_base, tarifa_por_m3, porcentaje_mora, dias_vencimiento
    } = req.body;
    
    // Desactivar configuraciones anteriores
    await pool.query('UPDATE configuracion_facturacion SET activo = 0');
    
    // Crear nueva configuración
    const [result] = await pool.query(`
      INSERT INTO configuracion_facturacion (
        nombre_acueducto, logo_url, nit, direccion, telefono, email,
        tarifa_base, tarifa_por_m3, porcentaje_mora, dias_vencimiento
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      nombre_acueducto, logo_url, nit, direccion, telefono, email,
      tarifa_base, tarifa_por_m3, porcentaje_mora, dias_vencimiento
    ]);
    
    res.status(201).json({ 
      id: result.insertId, 
      message: 'Configuración creada exitosamente' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar configuración existente
router.put('/:id', async (req, res) => {
  try {
    const {
      nombre_acueducto, logo_url, nit, direccion, telefono, email,
      tarifa_base, tarifa_por_m3, porcentaje_mora, dias_vencimiento
    } = req.body;
    
    const [result] = await pool.query(`
      UPDATE configuracion_facturacion SET
        nombre_acueducto = ?, logo_url = ?, nit = ?, direccion = ?,
        telefono = ?, email = ?, tarifa_base = ?, tarifa_por_m3 = ?,
        porcentaje_mora = ?, dias_vencimiento = ?
      WHERE id_config = ?
    `, [
      nombre_acueducto, logo_url, nit, direccion, telefono, email,
      tarifa_base, tarifa_por_m3, porcentaje_mora, dias_vencimiento,
      req.params.id
    ]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }
    
    res.json({ message: 'Configuración actualizada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
