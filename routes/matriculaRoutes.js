import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Obtener todas las matrículas
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT m.*, p.direccion, 
             u.nombre, u.apellido, u.telefono, u.email
      FROM matricula m
      JOIN predio p ON m.id_predio = p.id_predio
      JOIN usuario u ON m.cedula_propietario = u.cedula
      ORDER BY m.fecha_creacion DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener matrícula por número
router.get('/numero/:numero', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT m.*, p.direccion, p.telefono as telefono_predio, p.email as email_predio,
             u.cedula, u.nombre, u.apellido, u.telefono, u.email, u.direccion as direccion_usuario
      FROM matricula m
      JOIN predio p ON m.id_predio = p.id_predio
      JOIN usuario u ON m.cedula_propietario = u.cedula
      WHERE m.numero_matricula = ?
    `, [req.params.numero]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Matrícula no encontrada' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener matrículas por cédula de usuario
router.get('/usuario/:cedula', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT m.*, p.direccion
      FROM matricula m
      JOIN predio p ON m.id_predio = p.id_predio
      WHERE m.cedula_propietario = ?
      ORDER BY m.fecha_creacion DESC
    `, [req.params.cedula]);
    
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear matrícula
router.post('/', async (req, res) => {
  try {
    const { numero_matricula, id_predio, cedula_propietario, observaciones } = req.body;
    
    // Verificar que el predio existe
    const [predio] = await pool.query('SELECT * FROM predio WHERE id_predio = ?', [id_predio]);
    if (predio.length === 0) {
      return res.status(404).json({ error: 'Predio no encontrado' });
    }
    
    // Verificar que el usuario existe
    const [usuario] = await pool.query('SELECT * FROM usuario WHERE cedula = ?', [cedula_propietario]);
    if (usuario.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    // Verificar que el predio no tenga una matrícula activa
    const [matriculaExistente] = await pool.query(
      'SELECT * FROM matricula WHERE id_predio = ? AND estado = "activa"',
      [id_predio]
    );
    if (matriculaExistente.length > 0) {
      return res.status(400).json({ error: 'El predio ya tiene una matrícula activa' });
    }
    
    await pool.query(
      'INSERT INTO matricula (numero_matricula, id_predio, cedula_propietario, observaciones) VALUES (?, ?, ?, ?)',
      [numero_matricula, id_predio, cedula_propietario, observaciones]
    );
    
    res.status(201).json({ numero_matricula, message: 'Matrícula creada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar estado de matrícula
router.put('/:numero/estado', async (req, res) => {
  try {
    const { estado } = req.body;
    const [result] = await pool.query(
      'UPDATE matricula SET estado = ? WHERE numero_matricula = ?',
      [estado, req.params.numero]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Matrícula no encontrada' });
    }
    
    res.json({ message: 'Estado de matrícula actualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
