import express from 'express';
import townService from '../service/townService.js';
import logger from '../utils/logger.js';

const townRouter = express.Router();

// GET /towns/:districtId
townRouter.get('/:districtId', async (req, res) => {
  const { districtId } = req.params;
  try {
    const towns = await townService.fetchTownsByDistrictId(districtId);
    res.status(200).json(towns);
  } catch (err) {
    logger.error(`Error fetching towns for districtId=${districtId}:`, err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default townRouter;
