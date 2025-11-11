-- Script para actualizar observaciones de facturas existentes con mora
-- Este script calcula y agrega observaciones a facturas que tienen mora pero no tienen el campo observaciones

-- IMPORTANTE: Ejecutar este script solo si quieres actualizar facturas antiguas
-- Las nuevas facturas generadas con el sistema ya tendrán observaciones automáticamente

-- Ejemplo de uso en psql:
-- psql -h <host> -U <usuario> -d <base_datos> -f update-observaciones-facturas.sql

-- O desde Supabase SQL Editor:
-- Copiar y pegar el contenido de este archivo

-- Actualizar facturas que tienen un valor mayor al valor base estándar
-- Asumiendo que el valor base es 5000 y cualquier valor mayor incluye mora

UPDATE factura
SET observaciones = CONCAT(
  'Factura con mora. Valor total: $',
  valor::text,
  '. Generada antes del sistema de multas automáticas.'
)
WHERE observaciones IS NULL
  AND estado IN ('en_mora', 'Vencida')
  AND valor > 5000;

-- Verificar cuántas facturas se actualizaron
SELECT COUNT(*) as facturas_actualizadas
FROM factura
WHERE observaciones LIKE '%Generada antes del sistema de multas%';

-- Ver las facturas actualizadas
SELECT 
  id,
  cod_matricula,
  periodo_facturacion,
  valor,
  estado,
  observaciones
FROM factura
WHERE observaciones LIKE '%Generada antes del sistema de multas%'
ORDER BY id DESC
LIMIT 10;
