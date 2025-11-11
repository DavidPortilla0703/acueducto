-- Actualizar la factura #20 con observaciones de mora y multas
-- Ejecutar en Supabase SQL Editor

-- Actualizar factura #20
UPDATE factura
SET 
  observaciones = 'Incluye mora acumulada: $550,000.00 + Multas: $10,000.00 (2 factura(s) x $5,000). Detalle: 2025-10: $500000 + Multa: $5000, 2025-11: $50000 + Multa: $5000',
  valor = 565000
WHERE id = 20;

-- Verificar la actualización
SELECT 
  id,
  cod_matricula,
  valor,
  estado,
  observaciones
FROM factura
WHERE id = 20;
