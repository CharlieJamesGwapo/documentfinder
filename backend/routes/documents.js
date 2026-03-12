import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Op } from 'sequelize';

import cloudinary from '../config/cloudinary.js';
import { Document, AuditLog, User, sequelize } from '../models/index.js';
import { authorize } from '../middleware/auth.js';
import { logAudit } from '../utils/audit.js';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '../tmp');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  }
});

router.get('/overview', async (req, res) => {
  try {
    const manufacturingTypes = ['MN', 'MI', 'manufacturing'];
    const qualityTypes = ['QI', 'QAN', 'quality'];

    const [
      totalDocuments,
      manufacturingCount,
      qualityCount,
      storageBytes,
      recentDocuments,
      categoryBreakdown,
      typeBreakdown
    ] = await Promise.all([
      Document.count({ where: { isActive: true } }),
      Document.count({ where: { documentType: { [Op.in]: manufacturingTypes }, isActive: true } }),
      Document.count({ where: { documentType: { [Op.in]: qualityTypes }, isActive: true } }),
      Document.sum('fileSize', { where: { isActive: true } }),
      Document.findAll({
        where: { isActive: true },
        order: [['createdAt', 'DESC']],
        limit: 5,
        include: [{ association: 'author', attributes: ['id', 'name'] }]
      }),
      Document.findAll({
        attributes: [
          'category',
          [sequelize.fn('COUNT', sequelize.col('category')), 'count']
        ],
        where: { isActive: true },
        group: ['category'],
        order: [[sequelize.literal('count'), 'DESC']],
        limit: 6
      }),
      Document.findAll({
        attributes: [
          'documentType',
          [sequelize.fn('COUNT', sequelize.col('documentType')), 'count']
        ],
        where: { isActive: true },
        group: ['documentType'],
        order: [[sequelize.literal('count'), 'DESC']]
      })
    ]);

    res.json({
      totals: {
        totalDocuments,
        manufacturingCount,
        qualityCount
      },
      storageBytes: storageBytes || 0,
      recentDocuments,
      categoryBreakdown: categoryBreakdown.map((row) => ({
        category: row.get('category'),
        count: Number(row.get('count'))
      })),
      typeBreakdown: typeBreakdown.map((row) => ({
        type: row.get('documentType'),
        count: Number(row.get('count'))
      }))
    });
  } catch (error) {
    console.error('Overview error:', error);
    res.status(500).json({ message: 'Unable to fetch dashboard overview' });
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, JPG, and PNG files are allowed'));
    }
  }
});

router.post(
  '/',
  authorize('admin'),
  upload.single('document'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Document file is required' });
      }

      const { title, documentType, category } = req.body;
      if (!title || !title.trim()) {
        return res.status(400).json({ message: 'Title is required' });
      }
      if (!documentType) {
        return res.status(400).json({ message: 'Document type is required' });
      }
      if (!category || !category.trim()) {
        return res.status(400).json({ message: 'Category is required' });
      }

      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: 'document-finder',
        resource_type: 'auto'
      });

      // Clean up temp file
      fs.unlink(req.file.path, (err) => {
        if (err) console.warn('Temp file cleanup failed:', err.message);
      });

      const document = await Document.create({
        title: req.body.title,
        description: req.body.description,
        documentType: req.body.documentType,
        category: req.body.category,
        tags: req.body.tags ? req.body.tags.split(',').map((tag) => tag.trim()) : [],
        version: req.body.version || '1.0.0',
        fileUrl: uploadResult.secure_url,
        filePublicId: uploadResult.public_id,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        textContent: req.body.textContent || null,
        createdBy: req.user.id
      });

      const withAuthor = await Document.findByPk(document.id, {
        include: [{ association: 'author', attributes: ['id', 'name', 'email'] }]
      });

      await logAudit({
        userId: req.user.id,
        action: 'DOCUMENT_CREATED',
        description: `${req.user.name} uploaded ${document.title}`,
        metadata: { documentId: document.id },
        ipAddress: req.ip
      });

      res.status(201).json(withAuthor);
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: 'Unable to upload document' });
    }
  }
);

// Bulk file upload - multiple files at once (admin only)
router.post(
  '/bulk-upload',
  authorize('admin'),
  multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter(req, file, cb) {
      const allowed = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
      ];
      if (allowed.includes(file.mimetype)) cb(null, true);
      else cb(new Error('Only PDF, DOC, DOCX, JPG, and PNG files are allowed'));
    }
  }).array('documents', 20),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'At least one file is required' });
      }

      const { documentType, category } = req.body;
      if (!documentType) return res.status(400).json({ message: 'Document type is required' });
      if (!category) return res.status(400).json({ message: 'Category is required' });

      const results = [];
      const errors = [];

      for (const file of req.files) {
        try {
          const uploadResult = await cloudinary.uploader.upload(file.path, {
            folder: 'document-finder',
            resource_type: 'auto'
          });

          fs.unlink(file.path, (err) => {
            if (err) console.warn('Temp cleanup failed:', err.message);
          });

          const title = path.basename(file.originalname, path.extname(file.originalname))
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase());

          const document = await Document.create({
            title,
            description: '',
            documentType,
            category,
            tags: [],
            version: '1.0.0',
            fileUrl: uploadResult.secure_url,
            filePublicId: uploadResult.public_id,
            fileType: file.mimetype,
            fileSize: file.size,
            createdBy: req.user.id
          });

          results.push(document);
        } catch (fileError) {
          errors.push({ file: file.originalname, error: fileError.message });
          fs.unlink(file.path, () => {});
        }
      }

      await logAudit({
        userId: req.user.id,
        action: 'BULK_UPLOAD',
        description: `${req.user.name} bulk-uploaded ${results.length} documents`,
        metadata: { count: results.length, errors: errors.length },
        ipAddress: req.ip
      });

      res.status(201).json({
        created: results.length,
        failed: errors.length,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error) {
      console.error('Bulk upload error:', error);
      res.status(500).json({ message: 'Bulk upload failed' });
    }
  }
);

// CSV import - create documents from CSV file (admin only)
router.post(
  '/import-csv',
  authorize('admin'),
  multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter(req, file, cb) {
      if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
        cb(null, true);
      } else {
        cb(new Error('Only CSV files are allowed'));
      }
    }
  }).single('csvFile'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'CSV file is required' });
      }

      const csvContent = fs.readFileSync(req.file.path, 'utf-8');
      fs.unlink(req.file.path, () => {});

      const lines = csvContent.split('\n').filter((line) => line.trim());
      if (lines.length < 2) {
        return res.status(400).json({ message: 'CSV must have a header row and at least one data row' });
      }

      // Parse header
      const header = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));
      const titleIdx = header.findIndex((h) => h === 'title');
      const typeIdx = header.findIndex((h) => h === 'type' || h === 'documenttype' || h === 'document_type');
      const categoryIdx = header.findIndex((h) => h === 'category');
      const descIdx = header.findIndex((h) => h === 'description');
      const tagsIdx = header.findIndex((h) => h === 'tags');
      const versionIdx = header.findIndex((h) => h === 'version');

      if (titleIdx === -1) {
        return res.status(400).json({ message: 'CSV must have a "title" column' });
      }

      const validTypes = ['MN', 'MI', 'QI', 'QAN', 'VA', 'PCA', 'manufacturing', 'quality'];
      const results = [];
      const errors = [];

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = parseCSVLine(lines[i]);
          const title = values[titleIdx]?.trim();
          if (!title) {
            errors.push({ row: i + 1, error: 'Missing title' });
            continue;
          }

          const docType = typeIdx !== -1 ? values[typeIdx]?.trim().toUpperCase() : 'MN';
          const finalType = validTypes.includes(docType) ? docType : 'MN';
          const cat = categoryIdx !== -1 ? values[categoryIdx]?.trim() : 'General';
          const desc = descIdx !== -1 ? values[descIdx]?.trim() : '';
          const tags = tagsIdx !== -1
            ? values[tagsIdx]?.split(';').map((t) => t.trim()).filter(Boolean)
            : [];
          const version = versionIdx !== -1 ? values[versionIdx]?.trim() : '1.0.0';

          const document = await Document.create({
            title,
            description: desc || '',
            documentType: finalType,
            category: cat || 'General',
            tags,
            version: version || '1.0.0',
            fileUrl: null,
            filePublicId: null,
            fileType: null,
            fileSize: 0,
            createdBy: req.user.id
          });

          results.push(document);
        } catch (rowError) {
          errors.push({ row: i + 1, error: rowError.message });
        }
      }

      await logAudit({
        userId: req.user.id,
        action: 'CSV_IMPORT',
        description: `${req.user.name} imported ${results.length} documents from CSV`,
        metadata: { count: results.length, errors: errors.length },
        ipAddress: req.ip
      });

      res.status(201).json({
        created: results.length,
        failed: errors.length,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error) {
      console.error('CSV import error:', error);
      res.status(500).json({ message: 'CSV import failed' });
    }
  }
);

// Helper to parse CSV lines (handles quoted values with commas)
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit: rawLimit = 12,
      search,
      documentType,
      category,
      tags,
      fileType
    } = req.query;

    const limit = Math.min(Number(rawLimit) || 12, 100);
    const where = { isActive: true };

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (documentType) {
      where.documentType = documentType;
    }

    if (category) {
      where.category = category;
    }

    if (tags) {
      where.tags = { [Op.contains]: tags.split(',').map((tag) => tag.trim()) };
    }

    if (fileType) {
      if (fileType.includes('%')) {
        where.fileType = { [Op.iLike]: fileType };
      } else if (fileType.includes('*')) {
        where.fileType = { [Op.iLike]: fileType.replace('*', '%') };
      } else {
        where.fileType = fileType;
      }
    }

    const offset = (Number(page) - 1) * limit;

    const { rows, count } = await Document.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [{ association: 'author', attributes: ['id', 'name', 'email'] }]
    });

    res.json({
      documents: rows,
      pagination: {
        total: count,
        page: Number(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('List error:', error);
    res.status(500).json({ message: 'Unable to fetch documents' });
  }
});

// Export all documents (no pagination) for CSV/PDF/Word export
router.get('/export-all', async (req, res) => {
  try {
    const { search, documentType, category, tags, fileType } = req.query;
    const where = { isActive: true };

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (documentType) where.documentType = documentType;
    if (category) where.category = category;
    if (tags) where.tags = { [Op.contains]: tags.split(',').map((t) => t.trim()) };
    if (fileType) {
      if (fileType.includes('%')) where.fileType = { [Op.iLike]: fileType };
      else if (fileType.includes('*')) where.fileType = { [Op.iLike]: fileType.replace('*', '%') };
      else where.fileType = fileType;
    }

    const documents = await Document.findAll({
      where,
      order: [['createdAt', 'DESC']],
      include: [{ association: 'author', attributes: ['id', 'name', 'email'] }]
    });

    res.json({ documents });
  } catch (error) {
    console.error('Export-all error:', error);
    res.status(500).json({ message: 'Unable to fetch documents for export' });
  }
});

router.get('/stats', authorize('admin'), async (req, res) => {
  try {
    const manufacturingTypes = ['MN', 'MI', 'manufacturing'];
    const qualityTypes = ['QI', 'QAN', 'quality'];

    const [totalDocuments, manufacturingCount, qualityCount, categories] = await Promise.all([
      Document.count({ where: { isActive: true } }),
      Document.count({ where: { documentType: { [Op.in]: manufacturingTypes }, isActive: true } }),
      Document.count({ where: { documentType: { [Op.in]: qualityTypes }, isActive: true } }),
      Document.findAll({
        attributes: [
          'category',
          [sequelize.fn('COUNT', sequelize.col('category')), 'count']
        ],
        where: { isActive: true },
        group: ['category']
      })
    ]);

    res.json({
      totalDocuments,
      manufacturingCount,
      qualityCount,
      categories
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Unable to fetch stats' });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const rows = await Document.findAll({
      attributes: [
        [sequelize.fn('DISTINCT', sequelize.col('category')), 'category']
      ],
      where: { isActive: true },
      order: [[sequelize.col('category'), 'ASC']]
    });

    res.json(rows.map((row) => row.get('category')));
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ message: 'Unable to fetch categories' });
  }
});

router.get('/tags', async (req, res) => {
  try {
    const rows = await Document.findAll({
      attributes: ['tags'],
      where: { isActive: true }
    });

    const unique = new Set();
    rows.forEach((row) => {
      (row.tags || []).forEach((tag) => unique.add(tag));
    });

    res.json(Array.from(unique).sort());
  } catch (error) {
    console.error('Tags error:', error);
    res.status(500).json({ message: 'Unable to fetch tags' });
  }
});

router.get('/activity', async (req, res) => {
  try {
    const entries = await AuditLog.findAll({
      order: [['createdAt', 'DESC']],
      limit: 20,
      include: [{
        model: User,
        as: 'actor',
        attributes: ['id', 'name', 'photoUrl']
      }]
    });

    res.json(entries);
  } catch (error) {
    console.error('Activity feed error:', error);
    res.status(500).json({ message: 'Unable to fetch activity feed' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id, {
      include: [{ association: 'author', attributes: ['id', 'name', 'email'] }]
    });

    if (!document || !document.isActive) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    console.error('Detail error:', error);
    res.status(500).json({ message: 'Unable to fetch document' });
  }
});

router.put('/:id', authorize('admin'), async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const updates = {
      title: req.body.title,
      description: req.body.description,
      documentType: req.body.documentType,
      category: req.body.category,
      version: req.body.version,
      isActive: req.body.isActive
    };

    if (req.body.tags) {
      updates.tags = req.body.tags.split(',').map((tag) => tag.trim());
    }

    if (req.body.textContent !== undefined) {
      updates.textContent = req.body.textContent;
    }

    await document.update(updates);

    const withAuthor = await Document.findByPk(req.params.id, {
      include: [{ association: 'author', attributes: ['id', 'name', 'email'] }]
    });

    await logAudit({
      userId: req.user.id,
      action: 'DOCUMENT_UPDATED',
      description: `${req.user.name} updated ${document.title}`,
      metadata: { documentId: document.id },
      ipAddress: req.ip
    });

    res.json(withAuthor);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Unable to update document' });
  }
});

// Proxy download - avoids CORS issues with external file URLs
router.get('/:id/download', async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document || !document.isActive) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const fetch = (await import('node-fetch')).default;
    const response = await fetch(document.fileUrl);
    if (!response.ok) {
      return res.status(502).json({ message: 'Unable to fetch file from storage' });
    }

    // Build filename
    const extMap = {
      'application/pdf': '.pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
      'application/msword': '.doc',
      'image/jpeg': '.jpg',
      'image/png': '.png'
    };
    const ext = extMap[document.fileType] || '';
    const safeName = document.title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const filename = `${safeName}${ext}`;

    res.set({
      'Content-Type': document.fileType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-cache'
    });

    response.body.pipe(res);
  } catch (error) {
    console.error('Download proxy error:', error);
    res.status(500).json({ message: 'Unable to download file' });
  }
});

router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    await document.update({ isActive: false });

    await logAudit({
      userId: req.user.id,
      action: 'DOCUMENT_DELETED',
      description: `${req.user.name} archived ${document.title}`,
      metadata: { documentId: document.id },
      ipAddress: req.ip
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Unable to delete document' });
  }
});

export default router;
