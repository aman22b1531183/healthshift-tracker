// File: backend/src/server.ts

import dotenv from 'dotenv';
dotenv.config();

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

// Allowed origins from env with fallbacks
const allowedOrigins = process.env.FRONTEND_URLS?.split(',') || [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://healthshift-tracker.vercel.app'
];

// Log allowed origins for debugging
console.log('🌐 Allowed CORS origins:', allowedOrigins);

// Enhanced CORS configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, curl, postman)
    if (!origin) {
      console.log('✅ CORS: Allowing request with no origin');
      return callback(null, true);
    }
    
    console.log('🔍 CORS: Checking origin:', origin);
    
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS: Origin allowed:', origin);
      return callback(null, true);
    }
    
    // Also allow any *.vercel.app domains for preview deployments
    if (origin.endsWith('.vercel.app')) {
      console.log('✅ CORS: Allowing Vercel preview domain:', origin);
      return callback(null, true);
    }
    
    console.log('❌ CORS: Origin not allowed:', origin);
    console.log('📝 CORS: Allowed origins are:', allowedOrigins);
    return callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(helmet({
  crossOriginEmbedderPolicy: false,
}));

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', (req, res) => {
  console.log('🔄 Preflight request for:', req.path);
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(204);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    allowedOrigins: allowedOrigins
  });
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
  console.log(`🌐 CORS enabled for: ${allowedOrigins.join(', ')}`);
});