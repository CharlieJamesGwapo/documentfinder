import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { sequelize, User, Document } from '../models/index.js';

dotenv.config();

const SAMPLE_USER = {
  name: 'Demo Admin',
  email: 'demo.admin@tesla.com',
  password: 'DemoPass123!',
  role: 'admin'
};

const SAMPLES = [
  {
    title: 'Battery Pack Assembly Checklist',
    description: 'Torque specs and sequential checks for line 3 assemblies.',
    documentType: 'manufacturing',
    category: 'Powertrain',
    tags: ['battery', 'assembly', 'torque'],
    version: '1.0.0',
    fileUrl: 'https://res.cloudinary.com/dtr1tnutd/raw/upload/v1763998236/cwmeq1s3yjy2cg4c7csr.docx',
    filePublicId: 'cwmeq1s3yjy2cg4c7csr'
  },
  {
    title: 'Final Quality Gate – Paint',
    description: 'Inspection SOP for final clearcoat QA.',
    documentType: 'quality',
    category: 'Body',
    tags: ['quality', 'paint', 'inspection'],
    version: '2.1.0',
    fileUrl: 'https://res.cloudinary.com/dtr1tnutd/raw/upload/test_document_3_gtadth.pdf',
    filePublicId: 'test_document_3_gtadth'
  },
  {
    title: 'Drive Unit Calibration Update',
    description: 'DOCX instructions for calibrating new inverters.',
    documentType: 'manufacturing',
    category: 'Drivetrain',
    tags: ['drive-unit', 'calibration'],
    version: '0.9.5',
    fileUrl: 'https://res.cloudinary.com/dtr1tnutd/raw/upload/v1763998602/hwv8b6bqll7ydgfecmhd.docx',
    filePublicId: 'hwv8b6bqll7ydgfecmhd'
  }
];

const extensionToMime = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
};

const detectMime = (url) => {
  const match = url.match(/\.([a-z0-9]+)(?:\?|$)/i);
  if (!match) return 'application/octet-stream';
  return extensionToMime[match[1].toLowerCase()] || 'application/octet-stream';
};

const fetchSize = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const len = response.headers.get('content-length');
    return len ? parseInt(len, 10) : 0;
  } catch (error) {
    console.warn('Unable to fetch size for', url, error.message);
    return 0;
  }
};

const main = async () => {
  await sequelize.authenticate();
  await sequelize.sync();

  let user = await User.findOne({ where: { email: SAMPLE_USER.email }, paranoid: false });
  if (!user) {
    user = await User.create(SAMPLE_USER);
    console.log('Created demo admin user demo.admin@tesla.com (password: DemoPass123!)');
  }

  for (const sample of SAMPLES) {
    const size = await fetchSize(sample.fileUrl);
    const payload = {
      ...sample,
      fileType: detectMime(sample.fileUrl),
      fileSize: size,
      createdBy: user.id
    };

    const existing = await Document.findOne({ where: { title: sample.title }, paranoid: false });
    if (existing) {
      await existing.update(payload);
      console.log('Updated existing sample:', sample.title);
    } else {
      await Document.create(payload);
      console.log('Seeded sample document:', sample.title);
    }
  }

  await sequelize.close();
  console.log('Seeding complete.');
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
