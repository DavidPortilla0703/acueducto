import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tipo_mantenimiento WHERE activo = 1');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const [result] = await pool.query(
      'INSERT INTO tipo_mantenimiento (nombre, descripcion) VALUES (?, ?)',
      [nombre, descripcion]
    );
    res.status(201).json({ id: result.insertId, message: 'Tipo de mantenimiento creado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
