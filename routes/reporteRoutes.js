import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Obtener todos los reportes
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.*, 
             s.codigo_solicitud, s.matricula, s.observaciones as solicitud_observaciones,
             p.matricula, p.direccion, p.telefono, p.email,
             u.nombre as fontanero_nombre, u.apellido as fontanero_apellido,
             sol.nombre as solicitante_nombre, sol.apellido as solicitante_apellido
      FROM reporte_mantenimiento r
      JOIN solicitud_mantenimiento s ON r.codigo_solicitud = s.codigo_solicitud
      JOIN predio p ON s.matricula = p.matricula
      JOIN usuario sol ON s.cedula_solicitante = sol.cedula
      LEFT JOIN usuario u ON r.cedula_fontanero = u.cedula
      ORDER BY r.fecha_realizacion DESC
    `);
    res.json(rows || []);
  } catch (error) {
    console.error('Error en GET /reportes:', error);
    res.status(500).json({ error: error.message, data: [] });
  }
});

// Obtener reporte por ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.*, 
             s.codigo_solicitud, s.matricula, s.observaciones as solicitud_observaciones,
             p.matricula, p.direccion, p.telefono, p.email,
             u.nombre as fontanero_nombre, u.apellido as fontanero_apellido,
             sol.nombre as solicitante_nombre, sol.apellido as solicitante_apellido
      FROM reporte_mantenimiento r
      JOIN solicitud_mantenimiento s ON r.codigo_solicitud = s.codigo_solicitud
      JOIN predio p ON s.matricula = p.matricula
      JOIN usuario sol ON s.cedula_solicitante = sol.cedula
      LEFT JOIN usuario u ON r.cedula_fontanero = u.cedula
      WHERE r.id_reporte = ?
    `, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear reporte
router.post('/', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { codigo_solicitud, cedula_fontanero, descripcion_trabajo, materiales_usados, costo, estado_final, observaciones_finales } = req.body;
    
    // Verificar que la solicitud existe
    const [solicitud] = await connection.query(
      'SELECT * FROM solicitud_mantenimiento WHERE codigo_solicitud = ?',
      [codigo_solicitud]
    );
    
    if (solicitud.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }
    
    // Insertar reporte
    const [result] = await connection.query(
      `INSERT INTO reporte_mantenimiento 
       (codigo_solicitud, cedula_fontanero, descripcion_trabajo, materiales_usados, costo, estado_final, observaciones_finales) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [codigo_solicitud, cedula_fontanero, descripcion_trabajo, materiales_usados, costo, estado_final || 'completado', observaciones_finales]
    );
    
    // Actualizar estado de solicitud
    await connection.query(
      'UPDATE solicitud_mantenimiento SET estado = ? WHERE codigo_solicitud = ?',
      ['completado', codigo_solicitud]
    );
    
    await connection.commit();
    res.status(201).json({ id: result.insertId, message: 'Reporte creado exitosamente' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// Buscar reportes por código de solicitud, matrícula o cédula
router.get('/buscar/:termino', async (req, res) => {
  try {
    const termino = req.params.termino;
    const [rows] = await pool.query(`
      SELECT r.*, 
             s.codigo_solicitud, s.matricula,
             p.matricula, p.direccion,
             u.nombre as fontanero_nombre, u.apellido as fontanero_apellido,
             sol.nombre as solicitante_nombre, sol.apellido as solicitante_apellido
      FROM reporte_mantenimiento r
      JOIN solicitud_mantenimiento s ON r.codigo_solicitud = s.codigo_solicitud
      JOIN predio p ON s.matricula = p.matricula
      JOIN usuario sol ON s.cedula_solicitante = sol.cedula
      LEFT JOIN usuario u ON r.cedula_fontanero = u.cedula
      WHERE s.codigo_solicitud = ? OR s.matricula = ? OR s.cedula_solicitante = ?
      ORDER BY r.fecha_realizacion DESC
    `, [termino, termino, termino]);
    
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
