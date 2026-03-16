import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import dotenv from 'dotenv';

import routes from './routes/index.js';
import { sequelize, User } from './models/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);

const isProduction = process.env.NODE_ENV === 'production';

// CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://documentfinder.vercel.app',
  'https://documentfinder-git-main-*.vercel.app',
  'https://documentfinder-*.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, server-to-server)
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin.includes('*')) {
        const pattern = allowedOrigin.replace(/\*/g, '.*');
        return new RegExp(`^${pattern}$`).test(origin);
      }
      return allowedOrigin === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(isProduction ? 'combined' : 'dev'));

// General API rate limiter - 1000 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, please try again later.',
  skip: (req) => req.path.startsWith('/api/auth')
});

// Auth rate limiter - 50 requests per 15 minutes (more lenient for login/register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login attempts, please try again later.',
  keyGenerator: (req) => req.body?.email || req.ip
});

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Manufacturing & Quality Instruction Document Finder API',
    version: '1.0.1'
  });
});

app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter, routes);

app.use((err, req, res, next) => {
  // Handle CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ success: false, message: 'Origin not allowed' });
  }
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: isProduction ? 'Internal Server Error' : err.message || 'Internal Server Error'
  });
});

const seedAdminUser = async () => {
  try {
    const existingAdmin = await User.findOne({
      where: { email: 'melanie@admin.com' }
    });

    if (!existingAdmin) {
      await User.create({
        firstName: 'Melanie',
        middleName: '',
        lastName: 'Birmingham',
        suffix: '',
        email: 'melanie@admin.com',
        password: "Ma'am123",
        role: 'admin',
        isVerified: true,
        photoUrl: null,
        photoPublicId: null
      });

      console.log('[OK] Admin user created successfully');
      console.log('  Email: melanie@admin.com');
      console.log("  Password: Ma'am123");
    } else {
      console.log('[OK] Admin user already exists');
    }
  } catch (error) {
    console.error('[WARN] Error seeding admin user:', error.message);
  }
};

const seedDefaultUser = async () => {
  try {
    const existingUser = await User.findOne({
      where: { email: 'user@user.com' }
    });

    if (!existingUser) {
      await User.create({
        firstName: 'Default',
        middleName: '',
        lastName: 'User',
        suffix: '',
        email: 'user@user.com',
        password: 'user',
        role: 'user',
        isVerified: true,
        photoUrl: null,
        photoPublicId: null
      });

      console.log('[OK] Default user created successfully');
      console.log('  Email: user@user.com');
      console.log('  Password: user');
    } else {
      console.log('[OK] Default user already exists');
    }
  } catch (error) {
    console.error('[WARN] Error seeding default user:', error.message);
  }
};

const bootstrap = async () => {
  try {
    await sequelize.authenticate();
    console.log('[OK] Database connection established');
    // In production, sync without alter to avoid modifying existing tables
    // Use migrations for schema changes in production
    await sequelize.sync({ alter: true });
    await seedAdminUser();
    await seedDefaultUser();
    server.listen(PORT, () => {
      console.log(`[OK] Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

bootstrap();
