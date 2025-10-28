import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Obtener todas las facturas
router.get('/', async (req, res) => {
  try {
    const { estado, periodo } = req.query;
    let query = `
      SELECT f.*, m.numero_matricula, p.direccion,
             u.nombre, u.apellido, u.cedula
      FROM factura f
      JOIN matricula m ON f.numero_matricula = m.numero_matricula
      JOIN predio p ON m.id_predio = p.id_predio
      JOIN usuario u ON f.cedula_usuario = u.cedula
    `;
    
    const conditions = [];
    const params = [];
    
    if (estado) {
      conditions.push('f.estado = ?');
      params.push(estado);
    }
    
    if (periodo) {
      conditions.push('f.periodo_facturacion = ?');
      params.push(periodo);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY f.fecha_emision DESC';
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener factura por código
router.get('/codigo/:codigo', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT f.*, m.numero_matricula, p.direccion,
             u.cedula, u.nombre, u.apellido, u.telefono, u.email, u.direccion as direccion_usuario
      FROM factura f
      JOIN matricula m ON f.numero_matricula = m.numero_matricula
      JOIN predio p ON m.id_predio = p.id_predio
      JOIN usuario u ON f.cedula_usuario = u.cedula
      WHERE f.codigo_factura = ?
    `, [req.params.codigo]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }
    
    // Obtener detalles de la factura
    const [detalles] = await pool.query(
      'SELECT * FROM detalle_factura WHERE codigo_factura = ?',
      [req.params.codigo]
    );
    
    res.json({ ...rows[0], detalles });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener facturas por cédula de usuario
router.get('/usuario/:cedula', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT f.*, m.numero_matricula, p.direccion
      FROM factura f
      JOIN matricula m ON f.numero_matricula = m.numero_matricula
      JOIN predio p ON m.id_predio = p.id_predio
      WHERE f.cedula_usuario = ?
      ORDER BY f.fecha_emision DESC
    `, [req.params.cedula]);
    
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener facturas por matrícula
router.get('/matricula/:numero', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT f.*, u.nombre, u.apellido
      FROM factura f
      JOIN usuario u ON f.cedula_usuario = u.cedula
      WHERE f.numero_matricula = ?
      ORDER BY f.fecha_emision DESC
    `, [req.params.numero]);
    
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generar facturas para todas las matrículas activas
router.post('/generar', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { periodo_facturacion, consumos } = req.body; // consumos: { matricula: m3 }
    
    // Obtener configuración
    const [config] = await connection.query(
      'SELECT * FROM configuracion_facturacion WHERE activo = 1 LIMIT 1'
    );
    
    if (config.length === 0) {
      throw new Error('No hay configuración de facturación activa');
    }
    
    const { tarifa_base, tarifa_por_m3, porcentaje_mora, dias_vencimiento } = config[0];
    
    // Obtener matrículas activas
    const [matriculas] = await connection.query(`
      SELECT m.numero_matricula, m.cedula_propietario
      FROM matricula m
      WHERE m.estado = 'activa'
    `);
    
    const facturasCreadas = [];
    const fecha_emision = new Date();
    const fecha_vencimiento = new Date();
    fecha_vencimiento.setDate(fecha_vencimiento.getDate() + dias_vencimiento);
    
    for (const matricula of matriculas) {
      const consumo_m3 = consumos?.[matricula.numero_matricula] || 0;
      const valor_consumo = consumo_m3 * tarifa_por_m3;
      const valor_mantenimiento = tarifa_base;
      let subtotal = valor_consumo + valor_mantenimiento;
      let valor_mora = 0;
      
      // Verificar facturas en mora
      const [facturasEnMora] = await connection.query(`
        SELECT SUM(total) as deuda_mora
        FROM factura
        WHERE numero_matricula = ? AND estado IN ('vencida', 'en_mora')
      `, [matricula.numero_matricula]);
      
      if (facturasEnMora[0].deuda_mora) {
        valor_mora = facturasEnMora[0].deuda_mora * (porcentaje_mora / 100);
      }
      
      const total = subtotal + valor_mora;
      
      const codigo_factura = `FACT-${periodo_facturacion}-${String(facturasCreadas.length + 1).padStart(4, '0')}`;
      
      await connection.query(`
        INSERT INTO factura (
          codigo_factura, numero_matricula, cedula_usuario, periodo_facturacion,
          fecha_emision, fecha_vencimiento, consumo_m3, valor_consumo,
          valor_mantenimiento, subtotal, valor_mora, total
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        codigo_factura, matricula.numero_matricula, matricula.cedula_propietario,
        periodo_facturacion, fecha_emision, fecha_vencimiento, consumo_m3,
        valor_consumo, valor_mantenimiento, subtotal, valor_mora, total
      ]);
      
      // Insertar detalles
      await connection.query(`
        INSERT INTO detalle_factura (codigo_factura, concepto, cantidad, valor_unitario, valor_total)
        VALUES (?, ?, ?, ?, ?)
      `, [codigo_factura, 'Tarifa básica', 1, tarifa_base, tarifa_base]);
      
      if (consumo_m3 > 0) {
        await connection.query(`
          INSERT INTO detalle_factura (codigo_factura, concepto, cantidad, valor_unitario, valor_total)
          VALUES (?, ?, ?, ?, ?)
        `, [codigo_factura, `Consumo ${consumo_m3} m³`, consumo_m3, tarifa_por_m3, valor_consumo]);
      }
      
      if (valor_mora > 0) {
        await connection.query(`
          INSERT INTO detalle_factura (codigo_factura, concepto, cantidad, valor_unitario, valor_total)
          VALUES (?, ?, ?, ?, ?)
        `, [codigo_factura, 'Mora por pagos atrasados', 1, valor_mora, valor_mora]);
      }
      
      facturasCreadas.push(codigo_factura);
    }
    
    await connection.commit();
    res.status(201).json({ 
      message: `${facturasCreadas.length} facturas generadas exitosamente`,
      facturas: facturasCreadas
    });
    
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// Registrar pago
router.post('/:codigo/pago', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { monto_pagado, metodo_pago, referencia_pago, cedula_quien_paga } = req.body;
    
    // Obtener factura
    const [factura] = await connection.query(
      'SELECT * FROM factura WHERE codigo_factura = ?',
      [req.params.codigo]
    );
    
    if (factura.length === 0) {
      throw new Error('Factura no encontrada');
    }
    
    // Registrar pago
    await connection.query(`
      INSERT INTO pago (codigo_factura, monto_pagado, metodo_pago, referencia_pago, cedula_quien_paga)
      VALUES (?, ?, ?, ?, ?)
    `, [req.params.codigo, monto_pagado, metodo_pago, referencia_pago, cedula_quien_paga]);
    
    // Actualizar estado de factura si está completamente pagada
    const [pagos] = await connection.query(
      'SELECT SUM(monto_pagado) as total_pagado FROM pago WHERE codigo_factura = ?',
      [req.params.codigo]
    );
    
    if (pagos[0].total_pagado >= factura[0].total) {
      await connection.query(
        'UPDATE factura SET estado = "pagada", fecha_pago = NOW() WHERE codigo_factura = ?',
        [req.params.codigo]
      );
    }
    
    await connection.commit();
    res.status(201).json({ message: 'Pago registrado exitosamente' });
    
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// Actualizar estados de facturas vencidas (ejecutar periódicamente)
router.post('/actualizar-estados', async (req, res) => {
  try {
    const hoy = new Date();
    
    await pool.query(`
      UPDATE factura 
      SET estado = 'vencida'
      WHERE estado = 'pendiente' AND fecha_vencimiento < ?
    `, [hoy]);
    
    await pool.query(`
      UPDATE factura 
      SET estado = 'en_mora'
      WHERE estado = 'vencida' AND DATEDIFF(?, fecha_vencimiento) > 30
    `, [hoy]);
    
    res.json({ message: 'Estados actualizados' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
