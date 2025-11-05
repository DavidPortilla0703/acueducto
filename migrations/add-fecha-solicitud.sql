-- Agregar columna fecha_solicitud a la tabla solicitud_mantenimiento
ALTER TABLE solicitud_mantenimiento 
ADD COLUMN IF NOT EXISTS fecha_solicitud DATE DEFAULT CURRENT_DATE;

-- Actualizar registros existentes que no tienen fecha
UPDATE solicitud_mantenimiento 
SET fecha_solicitud = CURRENT_DATE 
WHERE fecha_solicitud IS NULL;

-- Comentario de la columna
COMMENT ON COLUMN solicitud_mantenimiento.fecha_solicitud IS 'Fecha en que se creó la solicitud de mantenimiento';
