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
import { sequelize } from './models/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);

const parseOrigins = (value = '') => value
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

const defaultFrontend = process.env.FRONTEND_URL || 'http://localhost:5173';
const configuredOrigins = parseOrigins(process.env.FRONTEND_URLS || defaultFrontend);
const extraOrigins = parseOrigins(process.env.EXTRA_ALLOWED_ORIGINS);
const renderUrl = process.env.RENDER_EXTERNAL_URL;
const vercelDomain = process.env.VERCEL_FRONTEND_DOMAIN;

console.log('🔐 CORS Configuration:');
console.log('  Configured Origins:', configuredOrigins);
console.log('  Extra Origins:', extraOrigins);
console.log('  Render URL:', renderUrl);
console.log('  Vercel Domain:', vercelDomain);

const buildCorsOriginValidator = () => {
  const staticOrigins = new Set([
    ...configuredOrigins,
    ...extraOrigins,
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'https://localhost:5173'
  ]);

  if (renderUrl) {
    staticOrigins.add(renderUrl);
  }

  const allowSubdomain = (origin, baseUrl) => {
    if (!baseUrl) return false;
    try {
      const baseHost = new URL(baseUrl).hostname;
      const originHost = new URL(origin).hostname;
      return originHost === baseHost || originHost.endsWith(`.${baseHost}`);
    } catch (error) {
      return false;
    }
  };

  const isLocalhost = (origin) => {
    try {
      const url = new URL(origin);
      return url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    } catch {
      return false;
    }
  };

  return (origin, callback) => {
    if (
      !origin ||
      staticOrigins.has(origin) ||
      isLocalhost(origin) ||
      allowSubdomain(origin, renderUrl) ||
      allowSubdomain(origin, vercelDomain ? `https://${vercelDomain}` : null)
    ) {
      callback(null, true);
    } else {
      console.warn('❌ CORS rejected origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  };
};

app.use(cors({
  origin: buildCorsOriginValidator(),
  credentials: true
}));
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

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
    version: '1.0.0'
  });
});

app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter, routes);

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const bootstrap = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    await sequelize.sync({ alter: true });
    server.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

bootstrap();
