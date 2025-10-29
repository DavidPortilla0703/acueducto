# Backend - Sistema Predial con Supabase

API REST para el sistema de gestión predial, acueducto y mantenimiento de fontanería.

## 🚀 Tecnologías

- **Node.js** + **Express** - Framework del servidor
- **Supabase** - Base de datos PostgreSQL en la nube
- **@supabase/supabase-js** - Cliente de Supabase
- **CORS** - Manejo de peticiones cross-origin
- **dotenv** - Variables de entorno

## 📋 Requisitos Previos

- Node.js 16 o superior
- Cuenta en Supabase (gratuita)
- npm o yarn

## ⚙️ Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en la carpeta `backend/`:

```env
PORT=3001

# Supabase Configuration
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-clave-anonima-de-supabase
```

**Obtener credenciales:**
1. Ve a [supabase.com](https://supabase.com)
2. Abre tu proyecto
3. Settings → API
4. Copia Project URL y anon/public key

### 3. Configurar base de datos

Las tablas ya están creadas en tu proyecto de Supabase. Si necesitas recrearlas, el script SQL está disponible en la documentación.

**Importante:** Desactiva Row Level Security para desarrollo:

```sql
ALTER TABLE usuario DISABLE ROW LEVEL SECURITY;
ALTER TABLE propietario DISABLE ROW LEVEL SECURITY;
ALTER TABLE predio DISABLE ROW LEVEL SECURITY;
ALTER TABLE matricula DISABLE ROW LEVEL SECURITY;
ALTER TABLE mantenimiento DISABLE ROW LEVEL SECURITY;
ALTER TABLE solicitud_mantenimiento DISABLE ROW LEVEL SECURITY;
ALTER TABLE factura DISABLE ROW LEVEL SECURITY;
ALTER TABLE pago DISABLE ROW LEVEL SECURITY;
```

### 4. Probar conexión

```bash
npm run test:db
```

Deberías ver:
```
✅ Conexión exitosa a Supabase
✅ usuario: 2 registros
✅ propietario: 2 registros
...
```

## 🏃 Ejecutar el Servidor

### Modo producción:
```bash
npm start
```

### Modo desarrollo (con auto-reload):
```bash
npm run dev
```

El servidor estará disponible en: **http://localhost:3001**

## 📡 Endpoints del API

### Predios
- `GET /api/predios` - Listar todos los predios
- `GET /api/predios/:id` - Obtener un predio
- `GET /api/predios/buscar/:termino` - Buscar predios
- `POST /api/predios` - Crear predio
- `PUT /api/predios/:id` - Actualizar predio

### Propietarios
- `GET /api/propietarios` - Listar propietarios
- `GET /api/propietarios/:cc` - Obtener propietario
- `POST /api/propietarios` - Crear propietario
- `PUT /api/propietarios/:cc` - Actualizar propietario

### Usuarios
- `GET /api/usuarios` - Listar usuarios
- `GET /api/usuarios/:cc` - Obtener usuario
- `POST /api/usuarios` - Crear usuario
- `PUT /api/usuarios/:cc` - Actualizar usuario

### Matrículas
- `GET /api/matriculas` - Listar matrículas
- `GET /api/matriculas/:codigo` - Obtener matrícula
- `GET /api/matriculas/predio/:id` - Matrículas por predio
- `POST /api/matriculas` - Crear matrícula
- `PUT /api/matriculas/:codigo/estado` - Actualizar estado

### Mantenimientos
- `GET /api/mantenimientos` - Listar mantenimientos
- `GET /api/mantenimientos/:id` - Obtener mantenimiento
- `POST /api/mantenimientos` - Crear mantenimiento
- `PUT /api/mantenimientos/:id` - Actualizar mantenimiento

### Solicitudes
- `GET /api/solicitudes` - Listar solicitudes
- `GET /api/solicitudes/:id` - Obtener solicitud
- `GET /api/solicitudes/predio/:id` - Solicitudes por predio
- `POST /api/solicitudes` - Crear solicitud
- `PUT /api/solicitudes/:id/estado` - Actualizar estado

### Facturas
- `GET /api/facturas` - Listar facturas
- `GET /api/facturas/:id` - Obtener factura
- `GET /api/facturas/matricula/:codigo` - Facturas por matrícula
- `POST /api/facturas` - Crear factura
- `PUT /api/facturas/:id/estado` - Actualizar estado
- `POST /api/facturas/:id/pago` - Registrar pago

### Pagos
- `GET /api/pagos` - Listar pagos
- `GET /api/pagos/factura/:id` - Pagos por factura

Ver documentación completa en: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## 📁 Estructura del Proyecto

```
backend/
├── config/
│   └── database.js          # Configuración de Supabase
├── routes/
│   ├── predioRoutes.js      # Rutas de predios
│   ├── propietarioRoutes.js # Rutas de propietarios
│   ├── usuarioRoutes.js     # Rutas de usuarios
│   ├── matriculaRoutes.js   # Rutas de matrículas
│   ├── mantenimientoRoutes.js # Rutas de mantenimientos
│   ├── solicitudRoutes.js   # Rutas de solicitudes
│   ├── facturaRoutes.js     # Rutas de facturas
│   └── pagoRoutes.js        # Rutas de pagos
├── .env                     # Variables de entorno
├── .env.example             # Ejemplo de variables
├── server.js                # Servidor principal
├── test-connection.js       # Script de prueba
└── package.json             # Dependencias
```

## 🧪 Scripts Disponibles

```bash
npm start          # Iniciar servidor
npm run dev        # Iniciar con nodemon (auto-reload)
npm run test:db    # Probar conexión a Supabase
```

## 🔒 Seguridad

- Las credenciales están en `.env` (no se suben a git)
- CORS configurado para desarrollo
- En producción, configura RLS en Supabase
- Valida datos de entrada en producción

## 🐛 Solución de Problemas

### El servidor no inicia
- Verifica que el puerto 3001 esté libre
- Revisa las credenciales en `.env`
- Ejecuta `npm install` nuevamente

### Error de conexión a Supabase
- Verifica SUPABASE_URL y SUPABASE_ANON_KEY
- Asegúrate de que el proyecto esté activo
- Revisa que RLS esté desactivado

### Error "relation does not exist"
- Las tablas no existen en Supabase
- Ejecuta el script SQL en el SQL Editor

## 📚 Recursos

- [Documentación de Express](https://expressjs.com/)
- [Documentación de Supabase](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

## 📝 Notas

- Este backend usa Supabase (PostgreSQL) en lugar de MySQL
- Los IDs son autoincrementales (BIGINT GENERATED ALWAYS AS IDENTITY)
- Las fechas están en formato ISO (YYYY-MM-DD)
- Los valores monetarios son NUMERIC(10,2)

## 🤝 Contribuir

1. Crea una rama para tu feature
2. Haz commit de tus cambios
3. Haz push a la rama
4. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial.
