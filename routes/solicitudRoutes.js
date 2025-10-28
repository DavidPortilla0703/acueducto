import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Obtener todas las solicitudes
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.*, 
             p.matricula, p.direccion, p.telefono, p.email,
             u.nombre as nombre_solicitante, u.apellido as apellido_solicitante,
             t.nombre as tipo_nombre
      FROM solicitud_mantenimiento s
      JOIN predio p ON s.matricula = p.matricula
      JOIN usuario u ON s.cedula_solicitante = u.cedula
      JOIN tipo_mantenimiento t ON s.id_tipo = t.id_tipo
      ORDER BY s.fecha_solicitud DESC
    `);
    res.json(rows || []);
  } catch (error) {
    console.error('Error en GET /solicitudes:', error);
    res.status(500).json({ error: error.message, data: [] });
  }
});

// Obtener solicitud por código
router.get('/:codigo', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.*, 
             p.matricula, p.direccion, p.telefono, p.email,
             u.nombre as nombre_solicitante, u.apellido as apellido_solicitante,
             u.telefono as telefono_solicitante, u.email as email_solicitante,
             t.nombre as tipo_nombre, t.descripcion as tipo_descripcion
      FROM solicitud_mantenimiento s
      JOIN predio p ON s.matricula = p.matricula
      JOIN usuario u ON s.cedula_solicitante = u.cedula
      JOIN tipo_mantenimiento t ON s.id_tipo = t.id_tipo
      WHERE s.codigo_solicitud = ?
    `, [req.params.codigo]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear solicitud
router.post('/', async (req, res) => {
  try {
    const { matricula, id_tipo, cedula_solicitante, observaciones, prioridad } = req.body;
    const codigo_solicitud = `SOL-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    
    // Verificar que la matrícula existe
    const [predioExiste] = await pool.query(
      'SELECT * FROM predio WHERE matricula = ?',
      [matricula]
    );
    
    if (predioExiste.length === 0) {
      return res.status(404).json({ error: 'Matrícula no encontrada' });
    }
    
    await pool.query(
      `INSERT INTO solicitud_mantenimiento 
       (codigo_solicitud, matricula, id_tipo, cedula_solicitante, observaciones, prioridad) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [codigo_solicitud, matricula, id_tipo, cedula_solicitante, observaciones, prioridad || 'media']
    );
    
    res.status(201).json({ codigo_solicitud, message: 'Solicitud creada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar estado de solicitud
router.put('/:codigo/estado', async (req, res) => {
  try {
    const { estado } = req.body;
    const [result] = await pool.query(
      'UPDATE solicitud_mantenimiento SET estado = ? WHERE codigo_solicitud = ?',
      [estado, req.params.codigo]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }
    
    res.json({ message: 'Estado actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar solicitudes por matrícula o cédula
router.get('/buscar/:termino', async (req, res) => {
  try {
    const termino = req.params.termino;
    const [rows] = await pool.query(`
      SELECT s.*, 
             p.matricula, p.direccion,
             u.nombre as nombre_solicitante, u.apellido as apellido_solicitante,
             t.nombre as tipo_nombre
      FROM solicitud_mantenimiento s
      JOIN predio p ON s.matricula = p.matricula
      JOIN usuario u ON s.cedula_solicitante = u.cedula
      JOIN tipo_mantenimiento t ON s.id_tipo = t.id_tipo
      WHERE s.matricula = ? OR s.cedula_solicitante = ? OR s.codigo_solicitud = ?
    `, [termino, termino, termino]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
