import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes';
import foodRoutes from './routes/foodRoutes';
import shoppingRoutes from './routes/shoppingRoutes';
import wasteRoutes from './routes/wasteRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import recipeRoutes from './routes/recipeRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/shopping', shoppingRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/recipes', recipeRoutes);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'FreshTrack API', version: '1.0.0' });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ message: 'Internal Server Error', error: err.message || err });
});

app.listen(PORT, () => {
  console.log(`🟢 FreshTrack Server running on http://localhost:${PORT}`);
});
