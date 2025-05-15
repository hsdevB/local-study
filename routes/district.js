import express from 'express';
import districtService from '../services/districtService.js';
import logger from '../utils/logger.js';

const router = express.Router();

// GET /districts/:cityId
router.get('/:cityId', async (req, res) => {
  const { cityId } = req.params;
  try {
    const districts = await districtService.fetchDistrictsByCityId(cityId);
    res.status(200).json(districts);
  } catch (err) {
    logger.error(`Error fetching districts for cityId=${cityId}:`, err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;
