import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM usuario');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:cedula', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM usuario WHERE cedula = ?', [req.params.cedula]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { cedula, nombre, apellido, telefono, email, direccion, tipo_usuario } = req.body;
    await pool.query(
      'INSERT INTO usuario (cedula, nombre, apellido, telefono, email, direccion, tipo_usuario) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [cedula, nombre, apellido, telefono, email, direccion, tipo_usuario]
    );
    res.status(201).json({ cedula, message: 'Usuario creado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:cedula', async (req, res) => {
  try {
    const { nombre, apellido, telefono, email, direccion, tipo_usuario, activo } = req.body;
    const [result] = await pool.query(
      'UPDATE usuario SET nombre = ?, apellido = ?, telefono = ?, email = ?, direccion = ?, tipo_usuario = ?, activo = ? WHERE cedula = ?',
      [nombre, apellido, telefono, email, direccion, tipo_usuario, activo, req.params.cedula]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
