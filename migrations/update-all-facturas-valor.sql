-- Actualizar el valor de todas las facturas a 2000
UPDATE facturas 
SET valor = 20000;

-- Verificar los cambios
SELECT id, cod_matricula, valor, estado, fecha_vencimiento 
FROM facturas 
ORDER BY id;
