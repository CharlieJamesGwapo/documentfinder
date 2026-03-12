import { Router } from 'express';
import { Favorite, Document, User } from '../models/index.js';

const router = Router();

// Get all favorites for current user (with document + author)
router.get('/', async (req, res) => {
  try {
    const favorites = await Favorite.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Document,
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'photoUrl']
        }]
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(favorites);
  } catch (error) {
    console.error('Favorites fetch error:', error);
    res.status(500).json({ message: 'Unable to fetch favorites' });
  }
});

// Get array of all favorited document IDs for current user
router.get('/ids', async (req, res) => {
  try {
    const favorites = await Favorite.findAll({
      where: { userId: req.user.id },
      attributes: ['documentId']
    });

    res.json(favorites.map((f) => f.documentId));
  } catch (error) {
    console.error('Favorite IDs fetch error:', error);
    res.status(500).json({ message: 'Unable to fetch favorite IDs' });
  }
});

// Check if a document is favorited by current user
router.get('/check/:documentId', async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      where: {
        userId: req.user.id,
        documentId: req.params.documentId
      }
    });

    res.json({ favorited: !!favorite });
  } catch (error) {
    console.error('Favorite check error:', error);
    res.status(500).json({ message: 'Unable to check favorite status' });
  }
});

// Toggle favorite (add if not exists, remove if exists)
router.post('/:documentId', async (req, res) => {
  try {
    const existing = await Favorite.findOne({
      where: {
        userId: req.user.id,
        documentId: req.params.documentId
      }
    });

    if (existing) {
      await existing.destroy();
      return res.json({ favorited: false });
    }

    await Favorite.create({
      userId: req.user.id,
      documentId: req.params.documentId
    });

    res.json({ favorited: true });
  } catch (error) {
    console.error('Favorite toggle error:', error);
    res.status(500).json({ message: 'Unable to toggle favorite' });
  }
});

export default router;
