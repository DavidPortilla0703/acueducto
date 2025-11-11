-- Agregar columna observaciones a la tabla factura
-- Esta columna almacenará el desglose de mora y multas

-- Agregar la columna si no existe
ALTER TABLE factura 
ADD COLUMN IF NOT EXISTS observaciones TEXT;

-- Agregar comentario a la columna
COMMENT ON COLUMN factura.observaciones IS 'Desglose de mora acumulada y multas. Ejemplo: Incluye mora acumulada: $10,000 + Multas: $5,000 (1 factura x $5,000)';

-- Verificar que la columna se creó
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'factura' AND column_name = 'observaciones';

-- Mostrar estructura de la tabla
\d factura
