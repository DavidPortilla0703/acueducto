# Documentación API - Sistema de Acueducto y Mantenimiento

## Base URL
```
http://localhost:3001/api
```

## Endpoints

### 1. PREDIOS

#### GET /predios
Obtener todos los predios
```json
Response: [
  {
    "id_predio": 1,
    "direccion": "Calle 10 #20-30",
    "tipo_predio": "casa",
    "area_metros": 120.00,
    "descripcion": "Casa de dos pisos",
    "fecha_registro": "2025-01-01T00:00:00.000Z"
  }
]
```

#### GET /predios/:id
Obtener predio por ID

#### POST /predios
Crear nuevo predio
```json
Request: {
  "direccion": "Calle 10 #20-30",
  "tipo_predio": "casa",
  "area_metros": 120.00,
  "descripcion": "Casa de dos pisos"
}
```

#### PUT /predios/:id
Actualizar predio

---

### 2. USUARIOS

#### GET /usuarios
Obtener todos los usuarios

#### GET /usuarios/:cedula
Obtener usuario por cédula

#### POST /usuarios
Crear nuevo usuario
```json
Request: {
  "cedula": "1001234567",
  "nombre": "Juan",
  "apellido": "Pérez",
  "telefono": "3001234567",
  "email": "juan@email.com",
  "direccion": "Calle 10 #20-30",
  "tipo_usuario": "propietario"
}
```

#### PUT /usuarios/:cedula
Actualizar usuario

---

### 3. MATRÍCULAS

#### GET /matriculas
Obtener todas las matrículas con información de predio y propietario

#### GET /matriculas/numero/:numero
Obtener matrícula por número
```json
Response: {
  "numero_matricula": "MAT-2025-001",
  "id_predio": 1,
  "cedula_propietario": "1001234567",
  "estado": "activa",
  "direccion": "Calle 10 #20-30",
  "nombre": "Juan",
  "apellido": "Pérez"
}
```

#### GET /matriculas/usuario/:cedula
Obtener todas las matrículas de un usuario

#### POST /matriculas
Crear nueva matrícula
```json
Request: {
  "numero_matricula": "MAT-2025-001",
  "id_predio": 1,
  "cedula_propietario": "1001234567",
  "observaciones": "Primera matrícula"
}
```

#### PUT /matriculas/:numero/estado
Actualizar estado de matrícula
```json
Request: {
  "estado": "suspendida"
}
```

---

### 4. FACTURAS

#### GET /facturas
Obtener todas las facturas
Query params: `?estado=pendiente&periodo=2025-01`

#### GET /facturas/codigo/:codigo
Obtener factura por código (incluye detalles)
```json
Response: {
  "codigo_factura": "FACT-2025-001",
  "numero_matricula": "MAT-2025-001",
  "cedula_usuario": "1001234567",
  "periodo_facturacion": "2025-01",
  "consumo_m3": 8.5,
  "total": 36250.00,
  "estado": "pendiente",
  "detalles": [
    {
      "concepto": "Tarifa básica",
      "valor_total": 15000.00
    }
  ]
}
```

#### GET /facturas/usuario/:cedula
Obtener todas las facturas de un usuario

#### GET /facturas/matricula/:numero
Obtener facturas de una matrícula

#### POST /facturas/generar
Generar facturas para todas las matrículas activas
```json
Request: {
  "periodo_facturacion": "2025-01",
  "consumos": {
    "MAT-2025-001": 8.5,
    "MAT-2025-002": 6.2
  }
}

Response: {
  "message": "5 facturas generadas exitosamente",
  "facturas": ["FACT-2025-0001", "FACT-2025-0002", ...]
}
```

#### POST /facturas/:codigo/pago
Registrar pago de factura
```json
Request: {
  "monto_pagado": 36250.00,
  "metodo_pago": "transferencia",
  "referencia_pago": "REF-001",
  "cedula_quien_paga": "1001234567"
}
```

#### POST /facturas/actualizar-estados
Actualizar estados de facturas vencidas (ejecutar periódicamente)

---

### 5. SOLICITUDES DE MANTENIMIENTO

#### GET /solicitudes
Obtener todas las solicitudes

#### GET /solicitudes/:codigo
Obtener solicitud por código

#### POST /solicitudes
Crear nueva solicitud
```json
Request: {
  "numero_matricula": "MAT-2025-001",
  "id_tipo": 1,
  "cedula_solicitante": "1002345678",
  "observaciones": "Fuga en el baño",
  "prioridad": "alta"
}
```

#### PUT /solicitudes/:codigo/estado
Actualizar estado de solicitud
```json
Request: {
  "estado": "en_proceso"
}
```

#### GET /solicitudes/buscar/:termino
Buscar por matrícula, cédula o código de solicitud

---

### 6. REPORTES DE MANTENIMIENTO

#### GET /reportes
Obtener todos los reportes

#### GET /reportes/:id
Obtener reporte por ID

#### POST /reportes
Crear nuevo reporte
```json
Request: {
  "codigo_solicitud": "SOL-2025-001",
  "cedula_fontanero": "1003456789",
  "descripcion_trabajo": "Se reparó la fuga",
  "materiales_usados": "Tubería PVC, cinta teflón",
  "costo": 50000.00,
  "estado_final": "completado",
  "observaciones_finales": "Trabajo completado satisfactoriamente"
}
```

#### GET /reportes/buscar/:termino
Buscar por código de solicitud, matrícula o cédula

---

### 7. TIPOS DE MANTENIMIENTO

#### GET /tipos-mantenimiento
Obtener todos los tipos activos

#### POST /tipos-mantenimiento
Crear nuevo tipo
```json
Request: {
  "nombre": "Reparación de fuga",
  "descripcion": "Reparación de fugas en tuberías"
}
```

---

### 8. CONFIGURACIÓN

#### GET /configuracion
Obtener configuración activa del sistema

#### POST /configuracion
Crear nueva configuración
```json
Request: {
  "nombre_acueducto": "Acueducto Municipal",
  "nit": "900123456-7",
  "direccion": "Calle Principal #10-20",
  "telefono": "3101234567",
  "email": "info@acueducto.com",
  "tarifa_base": 15000.00,
  "tarifa_por_m3": 2500.00,
  "porcentaje_mora": 2.5,
  "dias_vencimiento": 15
}
```

#### PUT /configuracion/:id
Actualizar configuración existente

---

## Códigos de Estado HTTP

- `200 OK` - Solicitud exitosa
- `201 Created` - Recurso creado exitosamente
- `404 Not Found` - Recurso no encontrado
- `500 Internal Server Error` - Error del servidor

## Notas Importantes

1. **Generación de Facturas**: Incluye validación automática de facturas en mora
2. **Matrículas**: Un predio solo puede tener una matrícula activa
3. **Pagos**: Se pueden registrar pagos parciales
4. **Estados de Factura**: pendiente → vencida → en_mora
5. **Prioridades de Solicitud**: baja, media, alta, urgente
