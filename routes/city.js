import express from 'express';
import cityService from '../service/cityService.js';
import logger from '../utils/logger.js';
import { AppError } from '../utils/errorHandler.js';

const cityRouter = express.Router();

// GET /cities
cityRouter.get('/', async (req, res) => {
  try {
    const cities = await cityService.fetchAllCities();
    res.status(200).json({
      success: true,
      message: '시/도 목록 조회 성공',
      data: cities
    });
  } catch (err) {
    logger.error('(cityRouter.fetchAllCities)', {
      error: err.toString()
    });

    if (err instanceof AppError) {
      res.status(err.statusCode).json({
        success: false,
        message: err.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: '시/도 목록 조회 중 오류가 발생했습니다.'
      });
    }
  }
});

export default cityRouter;
