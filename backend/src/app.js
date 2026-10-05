import express from 'express';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import negociosRoutes from './routes/negocios.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();
app.use(express.json());

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/negocios', negociosRoutes);

app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
app.use(errorHandler);

export default app;
