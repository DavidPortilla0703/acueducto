import express from 'express';
import multer from 'multer';
import supabase from '../config/database.js';

const router = express.Router();

// Configurar multer para almacenar archivos en memoria
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // Límite de 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF'));
    }
  }
});

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

// Actualizar facturas vencidas a estado "en_mora"
// IMPORTANTE: Esta ruta debe estar ANTES de /:id para evitar conflictos
router.post('/actualizar-mora', async (req, res) => {
  try {
    const fecha_actual = new Date().toISOString().split('T')[0];

    // Buscar facturas vencidas que no estén pagadas
    const { data: facturasVencidas, error: errorBusqueda } = await supabase
      .from('factura')
      .select('id, cod_matricula, fecha_vencimiento, valor')
      .in('estado', ['Pendiente', 'Vencida'])
      .lt('fecha_vencimiento', fecha_actual);

    if (errorBusqueda) throw errorBusqueda;

    if (!facturasVencidas || facturasVencidas.length === 0) {
      return res.json({
        message: 'No hay facturas vencidas para actualizar',
        facturas_actualizadas: 0
      });
    }

    // Actualizar estado a "en_mora"
    const facturasActualizadas = [];

    for (const factura of facturasVencidas) {
      const { error: errorActualizar } = await supabase
        .from('factura')
        .update({ estado: 'en_mora' })
        .eq('id', factura.id);

      if (!errorActualizar) {
        facturasActualizadas.push(factura.id);
      }
    }

    res.json({
      message: 'Facturas actualizadas a estado en mora',
      facturas_actualizadas: facturasActualizadas.length,
      ids: facturasActualizadas
    });

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

// Subir PDF a una factura
router.post('/:id/pdf', upload.single('pdf'), async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo PDF' });
    }

    // Verificar que la factura existe
    const { data: factura, error: facturaError } = await supabase
      .from('factura')
      .select('id')
      .eq('id', id)
      .single();

    if (facturaError || !factura) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    // Convertir el buffer a base64 para almacenar en PostgreSQL
    const pdfBase64 = req.file.buffer.toString('base64');

    // Actualizar la factura con el PDF
    const { error: updateError } = await supabase
      .from('factura')
      .update({
        pdf_documento: pdfBase64,
        pdf_nombre: req.file.originalname,
        pdf_tipo: req.file.mimetype
      })
      .eq('id', id);

    if (updateError) throw updateError;

    res.json({ 
      message: 'PDF guardado exitosamente',
      nombre: req.file.originalname,
      tamaño: req.file.size
    });

  } catch (error) {
    console.error('Error al guardar PDF:', error);
    res.status(500).json({ error: error.message || 'Error al guardar el PDF' });
  }
});

// Descargar PDF de una factura
router.get('/:id/pdf', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: factura, error } = await supabase
      .from('factura')
      .select('pdf_documento, pdf_nombre, pdf_tipo')
      .eq('id', id)
      .single();

    if (error || !factura) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    if (!factura.pdf_documento) {
      return res.status(404).json({ error: 'Esta factura no tiene PDF asociado' });
    }

    // Convertir de base64 a buffer
    const pdfBuffer = Buffer.from(factura.pdf_documento, 'base64');

    // Configurar headers para descarga
    res.setHeader('Content-Type', factura.pdf_tipo || 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${factura.pdf_nombre || 'factura.pdf'}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error al descargar PDF:', error);
    res.status(500).json({ error: error.message || 'Error al descargar el PDF' });
  }
});

// Generar facturas para TODAS las matrículas activas
router.post('/generar-masivo', async (req, res) => {
  try {
    const { periodo_facturacion, valor_base, dias_vencimiento = 15 } = req.body;

    if (!periodo_facturacion || !valor_base) {
      return res.status(400).json({
        error: 'Se requiere periodo_facturacion y valor_base'
      });
    }

    // Obtener TODAS las matrículas activas
    const { data: matriculas, error: matriculasError } = await supabase
      .from('matricula')
      .select('cod_matricula')
      .eq('estado', 'Activa');

    if (matriculasError) throw matriculasError;

    if (!matriculas || matriculas.length === 0) {
      return res.status(404).json({
        error: 'No hay matrículas activas para facturar'
      });
    }

    const fecha_emision = new Date();
    const fecha_vencimiento = new Date();
    fecha_vencimiento.setDate(fecha_vencimiento.getDate() + dias_vencimiento);

    const facturasCreadas = [];
    const errores = [];

    // Procesar TODAS las matrículas activas
    for (const matricula of matriculas) {
      try {
        // Verificar si ya existe factura para este periodo
        const { data: facturaExistente } = await supabase
          .from('factura')
          .select('id')
          .eq('cod_matricula', matricula.cod_matricula)
          .eq('periodo_facturacion', periodo_facturacion)
          .single();

        if (facturaExistente) {
          errores.push({
            matricula: matricula.cod_matricula,
            error: 'Ya existe factura para este periodo'
          });
          continue;
        }

        // Buscar facturas vencidas y no pagadas (mora acumulada)
        const { data: facturasEnMora } = await supabase
          .from('factura')
          .select('id, valor, periodo_facturacion, fecha_vencimiento')
          .eq('cod_matricula', matricula.cod_matricula)
          .in('estado', ['Pendiente', 'Vencida', 'en_mora'])
          .lt('fecha_vencimiento', fecha_emision.toISOString().split('T')[0]);

        let valor_mora_acumulado = 0;
        let observaciones_mora = '';

        // Calcular mora como suma acumulada de facturas no pagadas
        if (facturasEnMora && facturasEnMora.length > 0) {
          facturasEnMora.forEach(facturaMora => {
            const valor_factura = parseFloat(facturaMora.valor);
            valor_mora_acumulado += valor_factura;
            
            observaciones_mora += `Periodo ${facturaMora.periodo_facturacion}: $${valor_factura.toLocaleString()}. `;
          });

          // Actualizar estado de facturas en mora
          for (const facturaMora of facturasEnMora) {
            await supabase
              .from('factura')
              .update({ estado: 'en_mora' })
              .eq('id', facturaMora.id);
          }
        }

        // Valor total = valor fijo base + mora acumulada
        const valor_total = parseFloat(valor_base) + valor_mora_acumulado;

        // Crear nueva factura
        const { data: nuevaFactura, error: facturaError } = await supabase
          .from('factura')
          .insert([{
            cod_matricula: matricula.cod_matricula,
            periodo_facturacion,
            fecha_creacion: fecha_emision.toISOString().split('T')[0],
            fecha_vencimiento: fecha_vencimiento.toISOString().split('T')[0],
            valor: valor_total,
            estado: 'Pendiente',
            url: `facturas/${matricula.cod_matricula}_${periodo_facturacion}.pdf`,
            observaciones: valor_mora_acumulado > 0 
              ? `Incluye mora acumulada: $${valor_mora_acumulado.toLocaleString()}. ${observaciones_mora}` 
              : null
          }])
          .select()
          .single();

        if (facturaError) throw facturaError;

        facturasCreadas.push({
          matricula: matricula.cod_matricula,
          id_factura: nuevaFactura.id,
          valor_base: parseFloat(valor_base),
          valor_mora: valor_mora_acumulado,
          valor_total: valor_total,
          facturas_en_mora: facturasEnMora ? facturasEnMora.length : 0
        });

      } catch (error) {
        errores.push({
          matricula: matricula.cod_matricula,
          error: error.message
        });
      }
    }

    res.status(201).json({
      message: 'Proceso de facturación masiva completado',
      total_matriculas: matriculas.length,
      facturas_creadas: facturasCreadas.length,
      errores: errores.length,
      detalle: {
        exitosas: facturasCreadas,
        fallidas: errores
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
