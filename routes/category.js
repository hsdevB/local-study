import express from 'express';
import { fetchAllCategories } from '../services/categoryService.js';
import logger from '../utils/logger.js';

const router = express.Router();

// GET /categories
router.get('/', async (req, res) => {
  try {
    const categories = await fetchAllCategories();
    res.status(200).json(categories);
  } catch (err) {
    logger.error('Error fetching categories:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;