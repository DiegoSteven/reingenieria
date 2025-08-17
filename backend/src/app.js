import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import sequelize from './config/database.js';
import authRoutes from './routes/auth.js';
import usuarioRoutes from './routes/usuario.js';
import clienteRoutes from './routes/cliente.js';
import espacioRoutes from './routes/espacio.js';
import cajaRoutes from './routes/caja.js';
import configuracionRoutes from './routes/configuracion.js';
import facturaRoutes from './routes/factura.js';
import aboutRoutes from './routes/about.js';
import { setupSwagger } from './utils/swagger.js';
import { initDB } from './utils/db-init.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Probar conexión a la base de datos e inicializar
sequelize.authenticate()
  .then(() => {
    console.log('Conexión a PostgreSQL exitosa');
    return initDB();
  })
  .then(() => console.log('Base de datos inicializada correctamente'))
  .catch(err => console.error('Error de conexión o inicialización:', err));

app.get('/', (req, res) => {
  res.send('API de Parqueamiento funcionando');
});

// Rutas principales
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/espacios', espacioRoutes);
app.use('/api/caja', cajaRoutes);
app.use('/api/configuracion', configuracionRoutes);
app.use('/api/facturas', facturaRoutes);
app.use('/api/about', aboutRoutes);

// Swagger docs
setupSwagger(app);

export default app;
