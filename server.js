import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import predioRoutes from './routes/predioRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import tipoMantenimientoRoutes from './routes/tipoMantenimientoRoutes.js';
import solicitudRoutes from './routes/solicitudRoutes.js';
import reporteRoutes from './routes/reporteRoutes.js';
import matriculaRoutes from './routes/matriculaRoutes.js';
import facturaRoutes from './routes/facturaRoutes.js';
import configuracionRoutes from './routes/configuracionRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/predios', predioRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/tipos-mantenimiento', tipoMantenimientoRoutes);
app.use('/api/solicitudes', solicitudRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/matriculas', matriculaRoutes);
app.use('/api/facturas', facturaRoutes);
app.use('/api/configuracion', configuracionRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'API Sistema de Acueducto y Mantenimiento de Fontanería',
    version: '2.0',
    endpoints: {
      predios: '/api/predios',
      usuarios: '/api/usuarios',
      matriculas: '/api/matriculas',
      facturas: '/api/facturas',
      solicitudes: '/api/solicitudes',
      reportes: '/api/reportes',
      tiposMantenimiento: '/api/tipos-mantenimiento',
      configuracion: '/api/configuracion'
    }
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Documentación disponible en http://localhost:${PORT}`);
});
