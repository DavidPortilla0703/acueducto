# API Documentation - Sistema Predial con Supabase

## Base URL
```
http://localhost:3001/api
```

## Endpoints

### 1. Predios

#### GET /predios
Obtener todos los predios con información del propietario
```json
Response: [
  {
    "id": 1,
    "direccion": "Calle 12 #4-56",
    "propietario_cc": "2001",
    "telefono": "3174567890",
    "correo": "carlos@correo.com",
    "fecha_registro": "2025-03-05",
    "tipo": "Residencial",
    "propietario": {
      "cc": "2001",
      "nombre": "Carlos",
      "apellido": "Muñoz",
      "telefono": "3174567890",
      "correo": "carlos@correo.com"
    }
  }
]
```

#### GET /predios/:id
Obtener un predio específico

#### GET /predios/buscar/:termino
Buscar predios por dirección o CC del propietario

#### POST /predios
Crear un nuevo predio
```json
Request:
{
  "direccion": "Calle 45 #12-34",
  "propietario_cc": "2001",
  "telefono": "3001234567",
  "correo": "predio@correo.com",
  "tipo": "Residencial"
}
```

#### PUT /predios/:id
Actualizar un predio

---

### 2. Propietarios

#### GET /propietarios
Obtener todos los propietarios

#### GET /propietarios/:cc
Obtener un propietario por CC

#### POST /propietarios
Crear un nuevo propietario
```json
Request:
{
  "cc": "2003",
  "nombre": "Juan",
  "apellido": "Pérez",
  "telefono": "3001234567",
  "correo": "juan@correo.com"
}
```

#### PUT /propietarios/:cc
Actualizar un propietario

---

### 3. Usuarios

#### GET /usuarios
Obtener todos los usuarios

#### GET /usuarios/:cc
Obtener un usuario por CC

#### POST /usuarios
Crear un nuevo usuario
```json
Request:
{
  "cc": "1003",
  "nombre": "Ana",
  "apellido": "García",
  "telefono": "3009876543",
  "correo": "ana@correo.com"
}
```

#### PUT /usuarios/:cc
Actualizar un usuario

---

### 4. Matrículas

#### GET /matriculas
Obtener todas las matrículas con información del predio y propietario

#### GET /matriculas/:codigo
Obtener una matrícula por código

#### GET /matriculas/predio/:id
Obtener matrículas de un predio específico

#### POST /matriculas
Crear una nueva matrícula
```json
Request:
{
  "cod_matricula": "M003",
  "id_predio": 1,
  "estado": "Activa"
}
```

#### PUT /matriculas/:codigo/estado
Actualizar el estado de una matrícula
```json
Request:
{
  "estado": "Inactiva"
}
```

---

### 5. Mantenimientos

#### GET /mantenimientos
Obtener todos los mantenimientos

#### GET /mantenimientos/:id
Obtener un mantenimiento específico

#### POST /mantenimientos
Crear un nuevo tipo de mantenimiento
```json
Request:
{
  "nombre": "Reparación de Tuberías",
  "descripcion": "Mantenimiento correctivo de tuberías",
  "estado": "Pendiente"
}
```

#### PUT /mantenimientos/:id
Actualizar un mantenimiento

---

### 6. Solicitudes de Mantenimiento

#### GET /solicitudes
Obtener todas las solicitudes con información del predio y mantenimiento

#### GET /solicitudes/:id
Obtener una solicitud específica

#### GET /solicitudes/predio/:id
Obtener solicitudes de un predio específico

#### POST /solicitudes
Crear una nueva solicitud
```json
Request:
{
  "id_predio": 1,
  "id_mantenimiento": 1,
  "observaciones": "Fuga en el baño principal",
  "prioridad": "Alta"
}
```

#### PUT /solicitudes/:id/estado
Actualizar el estado de una solicitud
```json
Request:
{
  "estado": "Completada"
}
```

---

### 7. Facturas

#### GET /facturas
Obtener todas las facturas
Query params: `?estado=Pendiente`

#### GET /facturas/:id
Obtener una factura específica con sus pagos

#### GET /facturas/matricula/:codigo
Obtener facturas de una matrícula específica

#### POST /facturas
Crear una nueva factura
```json
Request:
{
  "cod_matricula": "M001",
  "fecha_vencimiento": "2025-08-31",
  "valor": 350000,
  "url": "facturas/factura_M001_agosto.pdf"
}
```

#### PUT /facturas/:id/estado
Actualizar el estado de una factura
```json
Request:
{
  "estado": "Pagada"
}
```

#### POST /facturas/:id/pago
Registrar un pago para una factura
```json
Request:
{
  "fecha_pago": "2025-07-15",
  "metodo_pago": "Transferencia",
  "valor": 350000
}
```

---

### 8. Pagos

#### GET /pagos
Obtener todos los pagos

#### GET /pagos/factura/:id
Obtener pagos de una factura específica

---

## Códigos de Estado HTTP

- `200 OK` - Solicitud exitosa
- `201 Created` - Recurso creado exitosamente
- `404 Not Found` - Recurso no encontrado
- `400 Bad Request` - Datos inválidos
- `500 Internal Server Error` - Error del servidor

## Notas

- Todas las fechas están en formato ISO: `YYYY-MM-DD`
- Los valores monetarios son de tipo `NUMERIC(10,2)`
- Las relaciones entre tablas se manejan mediante foreign keys
- Supabase maneja automáticamente los IDs autoincrementales
