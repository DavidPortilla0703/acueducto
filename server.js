import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import predioRoutes from './routes/predioRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import propietarioRoutes from './routes/propietarioRoutes.js';
import matriculaRoutes from './routes/matriculaRoutes.js';
import solicitudRoutes from './routes/solicitudRoutes.js';
import mantenimientoRoutes from './routes/mantenimientoRoutes.js';
import facturaRoutes from './routes/facturaRoutes.js';
import pagoRoutes from './routes/pagoRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/predios', predioRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/propietarios', propietarioRoutes);
app.use('/api/matriculas', matriculaRoutes);
app.use('/api/solicitudes', solicitudRoutes);
app.use('/api/mantenimientos', mantenimientoRoutes);
app.use('/api/facturas', facturaRoutes);
app.use('/api/pagos', pagoRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'API Sistema Predial - Acueducto y Mantenimiento',
    version: '3.0 - Supabase',
    endpoints: {
      predios: '/api/predios',
      usuarios: '/api/usuarios',
      propietarios: '/api/propietarios',
      matriculas: '/api/matriculas',
      solicitudes: '/api/solicitudes',
      mantenimientos: '/api/mantenimientos',
      facturas: '/api/facturas',
      pagos: '/api/pagos'
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Base de datos: Supabase (PostgreSQL)`);
  console.log(`📝 Documentación disponible en http://localhost:${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
});
