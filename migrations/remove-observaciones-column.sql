-- Eliminar la columna observaciones de la tabla facturas
ALTER TABLE facturas 
DROP COLUMN IF EXISTS observaciones;

-- Verificar la estructura de la tabla
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'facturas'
ORDER BY ordinal_position;
