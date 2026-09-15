import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import connectDB from './config/db.js';
import User from './models/User.js';
import { errorHandler } from './middlewares/errorHandler.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import artFormRoutes from './routes/artFormRoutes.js';
import artistRoutes from './routes/artistRoutes.js';
import showRoutes from './routes/showRoutes.js';
import postRoutes from './routes/postRoutes.js';
import experienceRoutes from './routes/experienceRoutes.js';

dotenv.config();

const app = express();


const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://twarita.onrender.com',
  process.env.CLIENT_URL
].filter(Boolean).map(o => o.replace(/\/$/, ''));

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/artforms', artFormRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/experiences', experienceRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Tvarita Arts API is operational' });
});

const seedAdminUser = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@tvarita.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'AdminTvarita2026!', 10);
      
      await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        isVerifiedArtist: true
      });

      console.log(`[Admin Seed]: Admin account created successfully (${adminEmail})`);
    } else {
      console.log(`[Admin Seed]: Admin account already exists.`);
    }
  } catch (error) {
    console.error('[Admin Seed Error]:', error.message);
  }
};


app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  await seedAdminUser();
  app.listen(PORT, () => {
    console.log(`[Server Running]: Port ${PORT}`);
  });
});