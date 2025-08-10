// File: backend/src/server.ts
// FINAL CORRECTED VERSION

// Load environment variables from .env file BEFORE anything else.
import dotenv from 'dotenv';
dotenv.config();

// Now, import the rest of the modules
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { authRoutes } from './routes/auth';
import { shiftRoutes } from './routes/shifts';
import { locationRoutes } from './routes/locations';
import { dashboardRoutes } from './routes/dashboard';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/shifts', authMiddleware, shiftRoutes);
app.use('/api/locations', authMiddleware, locationRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});