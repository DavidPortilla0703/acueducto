// Este es el endpoint corregido para generar-masivo
// Reemplazar en facturaRoutes.js líneas 360-500

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

        // Buscar facturas pendientes anteriores (no pagadas)
        // La mora es acumulativa: suma de todas las facturas pendientes
        const { data: facturasEnMora } = await supabase
          .from('factura')
          .select('id, valor, periodo_facturacion, fecha_vencimiento')
          .eq('cod_matricula', matricula.cod_matricula)
          .in('estado', ['Pendiente', 'Vencida', 'en_mora'])
          .lt('fecha_vencimiento', fecha_emision.toISOString().split('T')[0]);

        let valor_mora_acumulado = 0;
        let detalle_mora = [];

        if (facturasEnMora && facturasEnMora.length > 0) {
          // La mora es la suma de todas las facturas pendientes
          facturasEnMora.forEach(facturaMora => {
            const valor_factura = parseFloat(facturaMora.valor);
            valor_mora_acumulado += valor_factura;
            
            detalle_mora.push({
              periodo: facturaMora.periodo_facturacion,
              valor: valor_factura
            });
          });

          // Actualizar estado de facturas en mora a "en_mora"
          for (const facturaMora of facturasEnMora) {
            await supabase
              .from('factura')
              .update({ estado: 'en_mora' })
              .eq('id', facturaMora.id);
          }
        }

        // El valor total es: valor_base (fijo para todos) + mora acumulada
        const valor_total = parseFloat(valor_base) + valor_mora_acumulado;

        // Crear nueva factura SIN observaciones
        const { data: nuevaFactura, error: facturaError } = await supabase
          .from('factura')
          .insert([{
            cod_matricula: matricula.cod_matricula,
            periodo_facturacion,
            fecha_creacion: fecha_emision.toISOString().split('T')[0],
            fecha_vencimiento: fecha_vencimiento.toISOString().split('T')[0],
            valor: valor_total,
            estado: 'Pendiente',
            url: `facturas/${matricula.cod_matricula}_${periodo_facturacion}.pdf`
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
          facturas_en_mora: facturasEnMora ? facturasEnMora.length : 0,
          detalle_mora: detalle_mora
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
