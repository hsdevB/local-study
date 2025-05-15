import express from 'express';
import categoryService from '../service/categoryService.js';
import logger from '../utils/logger.js';

const categoryRouter = express.Router();

// GET /categories
categoryRouter.get('/', async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.status(200).json(categories);
  } catch (err) {
    logger.error('Error fetching categories:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default categoryRouter;