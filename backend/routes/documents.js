import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Op } from 'sequelize';

import cloudinary from '../config/cloudinary.js';
import { Document, sequelize } from '../models/index.js';
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
    const [
      totalDocuments,
      manufacturingCount,
      qualityCount,
      storageBytes,
      recentDocuments,
      categoryBreakdown
    ] = await Promise.all([
      Document.count({ where: { isActive: true } }),
      Document.count({ where: { documentType: 'manufacturing', isActive: true } }),
      Document.count({ where: { documentType: 'quality', isActive: true } }),
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
  upload.single('document'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Document file is required' });
      }

      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: 'document-finder',
        resource_type: 'auto'
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

router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      documentType,
      category,
      tags,
      fileType
    } = req.query;

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

    const offset = (Number(page) - 1) * Number(limit);

    const { rows, count } = await Document.findAndCountAll({
      where,
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']],
      include: [{ association: 'author', attributes: ['id', 'name', 'email'] }]
    });

    res.json({
      documents: rows,
      pagination: {
        total: count,
        page: Number(page),
        pages: Math.ceil(count / Number(limit))
      }
    });
  } catch (error) {
    console.error('List error:', error);
    res.status(500).json({ message: 'Unable to fetch documents' });
  }
});

router.get('/stats', authorize('admin'), async (req, res) => {
  try {
    const totalDocuments = await Document.count();
    const manufacturingCount = await Document.count({ where: { documentType: 'manufacturing' } });
    const qualityCount = await Document.count({ where: { documentType: 'quality' } });

    const categories = await Document.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('category')), 'count']
      ],
      group: ['category']
    });

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

router.put('/:id', async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (document.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this document' });
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

router.delete('/:id', async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (document.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this document' });
    }

    await cloudinary.uploader.destroy(document.filePublicId);
    await document.destroy();

    await logAudit({
      userId: req.user.id,
      action: 'DOCUMENT_DELETED',
      description: `${req.user.name} deleted ${document.title}`,
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
