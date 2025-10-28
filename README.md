# Backend - Sistema de Acueducto y Mantenimiento

API REST para el sistema de gestión de acueducto y mantenimiento de fontanería.

## Requisitos

- Node.js 16+
- MySQL 8.0+
- npm o pnpm

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
Copiar `.env.example` a `.env` y configurar:
```env
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=mantenimiento_fontaneria
DB_PORT=3306
```

3. Crear la base de datos:
```bash
cd ../database
setup.bat
```

## Ejecución

### Modo desarrollo (con auto-reload):
```bash
npm run dev
```

### Modo producción:
```bash
npm start
```

El servidor estará disponible en `http://localhost:3001`

## Estructura del Proyecto

```
backend/
├── config/
│   └── database.js          # Configuración de MySQL
├── routes/
│   ├── predioRoutes.js      # Gestión de predios
│   ├── usuarioRoutes.js     # Gestión de usuarios
│   ├── matriculaRoutes.js   # Gestión de matrículas
│   ├── facturaRoutes.js     # Facturación y pagos
│   ├── solicitudRoutes.js   # Solicitudes de mantenimiento
│   ├── reporteRoutes.js     # Reportes de mantenimiento
│   ├── tipoMantenimientoRoutes.js
│   └── configuracionRoutes.js
├── server.js                # Punto de entrada
├── .env                     # Variables de entorno
└── API_DOCUMENTATION.md     # Documentación completa

## Endpoints Principales

### Matrículas
- `GET /api/matriculas` - Listar todas
- `GET /api/matriculas/numero/:numero` - Por número
- `GET /api/matriculas/usuario/:cedula` - Por usuario
- `POST /api/matriculas` - Crear matrícula

### Facturas
- `GET /api/facturas` - Listar todas
- `GET /api/facturas/codigo/:codigo` - Por código
- `GET /api/facturas/usuario/:cedula` - Por usuario
- `POST /api/facturas/generar` - Generar facturas masivas
- `POST /api/facturas/:codigo/pago` - Registrar pago

### Solicitudes
- `GET /api/solicitudes` - Listar todas
- `POST /api/solicitudes` - Crear solicitud
- `GET /api/solicitudes/buscar/:termino` - Buscar

Ver `API_DOCUMENTATION.md` para documentación completa.

## Funcionalidades Implementadas

✅ **Historia 1**: Facturación con validación de mora
✅ **Historia 3**: Consulta de facturas por código o cédula
✅ **Historia 4**: Generación de matrículas
✅ **Historia 5**: Consulta de matrículas
✅ **Historia 6**: Solicitudes de mantenimiento
✅ **Historia 7**: Reportes de mantenimiento

## Características

- **Transacciones**: Operaciones críticas usan transacciones MySQL
- **Validaciones**: Verificación de integridad referencial
- **Cálculo automático de mora**: Basado en configuración
- **Pagos parciales**: Soporte para múltiples pagos por factura
- **Estados automáticos**: Actualización de estados de facturas

## Testing

Puedes probar los endpoints con:
- Postman
- Thunder Client (VS Code)
- curl

Ejemplo:
```bash
curl http://localhost:3001/api/matriculas
```

## Notas de Desarrollo

1. La generación de facturas valida automáticamente facturas en mora
2. Un predio solo puede tener una matrícula activa
3. Las matrículas deben estar activas para crear solicitudes
4. Los pagos actualizan automáticamente el estado de las facturas
