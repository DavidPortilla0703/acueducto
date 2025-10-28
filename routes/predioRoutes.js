import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Obtener todos los predios con información del propietario
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, 
             m.numero_matricula as matricula_numero,
             m.cedula_propietario,
             CONCAT(u.nombre, ' ', u.apellido) as propietario,
             u.telefono as telefono_propietario,
             u.email as email_propietario
      FROM predio p
      LEFT JOIN matricula m ON p.matricula = m.numero_matricula
      LEFT JOIN usuario u ON m.cedula_propietario = u.cedula
      ORDER BY p.fecha_registro DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener todas las matrículas disponibles
router.get('/matriculas/lista', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT matricula, direccion, telefono, email 
      FROM predio 
      WHERE matricula IS NOT NULL 
      ORDER BY matricula ASC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar matrícula por término
router.get('/matriculas/buscar/:termino', async (req, res) => {
  try {
    const termino = `%${req.params.termino}%`;
    const [rows] = await pool.query(`
      SELECT matricula, direccion, telefono, email 
      FROM predio 
      WHERE matricula LIKE ? OR direccion LIKE ?
      ORDER BY matricula ASC
    `, [termino, termino]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener predio por ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM predio WHERE id_predio = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Predio no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear predio
router.post('/', async (req, res) => {
  try {
    const { matricula, direccion, telefono, email } = req.body;
    const [result] = await pool.query(
      'INSERT INTO predio (matricula, direccion, telefono, email) VALUES (?, ?, ?, ?)',
      [matricula, direccion, telefono, email]
    );
    res.status(201).json({ id_predio: result.insertId, message: 'Predio creado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar predio
router.put('/:id', async (req, res) => {
  try {
    const { matricula, direccion, telefono, email } = req.body;
    const [result] = await pool.query(
      'UPDATE predio SET matricula = ?, direccion = ?, telefono = ?, email = ? WHERE id_predio = ?',
      [matricula, direccion, telefono, email, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Predio no encontrado' });
    }
    res.json({ message: 'Predio actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
