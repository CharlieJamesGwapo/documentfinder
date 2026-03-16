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
import { sequelize, User, Document } from './models/index.js';

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

const DEPT_LIST = ['Battery Module', 'Battery Pack', 'Drive Unit', 'Energy', 'Mega Pack', 'Power Wall', 'PCS', 'Semi'];
const PDF_URL = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
const DOCX_URL = 'https://calibre-ebook.com/downloads/demos/demo.docx';

const TYPE_SEED = {
  MN: { suffixes: ['Line Shutdown Notice','Material Change Alert','Shift Schedule Update','Equipment Installation','Ramp-Up Plan','Safety Protocol Update','Tooling Changeover Notice','Maintenance Window Alert'], tags: ['manufacturing','notice'], text: 'MANUFACTURING NOTICE\n\nThis manufacturing notice covers critical updates for the {dept} department.\n\nACTION REQUIRED:\n- Review affected procedures\n- Update work instructions\n- Notify shift supervisors\n- Complete training by effective date\n\nAPPROVED BY: Manufacturing Engineering Director' },
  MI: { suffixes: ['Assembly Procedure','Installation Guide','Operation Manual','Calibration Steps','Testing Protocol','Setup Instructions','Maintenance Procedure','Changeover Guide'], tags: ['manufacturing','instructions'], text: 'MANUFACTURING INSTRUCTIONS\n\nStep-by-step manufacturing instructions for the {dept} area.\n\n1. Verify all materials and tools\n2. Confirm workstation setup\n3. Follow assembly sequence\n4. Perform in-process quality checks\n5. Document completion in production log\n\nAPPROVED BY: Manufacturing Engineering' },
  QI: { suffixes: ['Incoming Inspection','Weld Quality Check','Paint Inspection Standards','Audit Checklist','Validation Procedure','Dimensional Check','Functional Test','Material Verification'], tags: ['quality','inspection'], text: 'QUALITY INSTRUCTIONS\n\nInspection criteria for the {dept} area.\n\n- Visual inspection against reference\n- Dimensional verification per drawing\n- Functional test per specification\n- Documentation in quality system\n\nAPPROVED BY: Quality Engineering Director' },
  QAN: { suffixes: ['Torque Non-Conformance','Material Deviation Alert','Defect Cluster Alert','Fastener Recall Notice','Calibration Error Report','Weld Defect Alert','Surface Finish Issue','Assembly Gap Alert'], tags: ['quality','alert'], text: 'QUALITY ALERT NOTICE\n\nALERT LEVEL: HIGH\nDEPARTMENT: {dept}\n\nImmediate action required.\n\n1. Stop affected process\n2. Quarantine suspect material\n3. Notify quality engineering\n4. Begin root cause analysis\n\nISSUED BY: Quality Engineering' },
  VA: { suffixes: ['Connector ID Guide','PPE Requirements','Torque Sequence Diagram','Fluid Fill Chart','Error Code Reference','Assembly Diagram','Routing Map','Inspection Points'], tags: ['visual','reference'], text: 'VISUAL AIDE\n\nQuick reference for the {dept} department.\n\n- Follow color-coded indicators\n- Check reference standards before each shift\n- Report discrepancies immediately\n\nAPPROVED BY: Engineering' },
  PCA: { suffixes: ['Weld Parameter Update','Line Speed Increase','Adhesive Introduction','Vision Inspection Deploy','Packaging Change','Robot Program Update','Fixture Modification','Material Substitution'], tags: ['process-change','approval'], text: 'PROCESS CHANGE APPROVAL\n\nSTATUS: APPROVED\nDEPARTMENT: {dept}\n\nValidation: PASSED\nSafety review: No concerns\n\nTrain affected operators and monitor for 2 weeks.\n\nAPPROVED BY: Process Engineering, Quality, Manufacturing' }
};

const seedDocuments = async () => {
  try {
    const admin = await User.findOne({ where: { role: 'admin' } });
    if (!admin) return;

    const docCount = await Document.count();
    // Only auto-seed if DB has fewer than 48 documents (fresh or outdated)
    if (docCount >= 48) {
      console.log(`[OK] Documents already seeded (${docCount} found)`);
      return;
    }

    const urls = [PDF_URL, DOCX_URL];
    let created = 0;

    for (const [type, data] of Object.entries(TYPE_SEED)) {
      for (let i = 0; i < DEPT_LIST.length; i++) {
        const dept = DEPT_LIST[i];
        const title = `${dept} - ${data.suffixes[i]}`;
        const existing = await Document.findOne({ where: { title }, paranoid: false });
        if (existing) continue;

        await Document.create({
          title,
          description: `${data.suffixes[i]} for the ${dept} department.`,
          documentType: type,
          category: dept,
          tags: [...data.tags, dept.toLowerCase().replace(/\s+/g, '-')],
          version: `${Math.floor(i / 3) + 1}.${i % 3}.0`,
          fileUrl: urls[i % urls.length],
          filePublicId: `seed_${type.toLowerCase()}_${dept.toLowerCase().replace(/\s+/g, '_')}_${String(i + 1).padStart(3, '0')}`,
          fileType: i % 2 === 0 ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          fileSize: 15000 + Math.floor(Math.random() * 30000),
          textContent: data.text.replace(/\{dept\}/g, dept),
          createdBy: admin.id
        });
        created++;
      }
    }

    if (created > 0) {
      console.log(`[OK] Auto-seeded ${created} documents (6 types × 8 departments)`);
    }
  } catch (error) {
    console.error('[WARN] Error auto-seeding documents:', error.message);
  }
};

const bootstrap = async () => {
  try {
    await sequelize.authenticate();
    console.log('[OK] Database connection established');
    await sequelize.sync({ alter: true });
    await seedAdminUser();
    await seedDefaultUser();
    await seedDocuments();
    server.listen(PORT, () => {
      console.log(`[OK] Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

bootstrap();
