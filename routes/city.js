import express from 'express';
import cityService from '../services/cityService.js';
import logger from '../utils/logger.js';

const router = express.Router();

// GET /cities
router.get('/', async (req, res) => {
  try {
    const cities = await cityService.fetchAllCities();
    res.status(200).json(cities);
  } catch (err) {
    logger.error('Error fetching cities:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;
