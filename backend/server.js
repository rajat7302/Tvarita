import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { errorHandler } from './middlewares/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import artFormRoutes from './routes/artFormRoutes.js';
import artistRoutes from './routes/artistRoutes.js';
import showRoutes from './routes/showRoutes.js';
import postRoutes from './routes/postRoutes.js';
import experienceRoutes from './routes/experienceRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/artforms', artFormRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/experiences', experienceRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Tvarita Arts API is operational' });
});

// Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[Server Running]: Port ${PORT}`);
  });
});