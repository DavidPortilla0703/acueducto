-- Agregar columnas para almacenar PDFs en la tabla factura
-- Ejecuta este SQL en el SQL Editor de Supabase

ALTER TABLE factura 
ADD COLUMN IF NOT EXISTS pdf_documento TEXT,
ADD COLUMN IF NOT EXISTS pdf_nombre VARCHAR(255),
ADD COLUMN IF NOT EXISTS pdf_tipo VARCHAR(100);

-- Verificar que las columnas se agregaron correctamente
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'factura' 
AND column_name LIKE 'pdf%';
