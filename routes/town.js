import express from 'express';
import townService from '../services/townService.js';
import logger from '../utils/logger.js';

const router = express.Router();

// GET /towns/:districtId
router.get('/:districtId', async (req, res) => {
  const { districtId } = req.params;
  try {
    const towns = await townService.fetchTownsByDistrictId(districtId);
    res.status(200).json(towns);
  } catch (err) {
    logger.error(`Error fetching towns for districtId=${districtId}:`, err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;
