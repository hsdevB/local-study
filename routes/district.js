import express from 'express';
import districtService from '../service/districtService.js';
import logger from '../utils/logger.js';
import { AppError } from '../utils/errorHandler.js';

const districtRouter = express.Router();

// GET /districts/:cityId
districtRouter.get('/:cityId', async (req, res) => {
  const { cityId } = req.params;
  try {
    if (!cityId) {
      throw new AppError('시/도 ID는 필수 입력값입니다.', 400);
    }

    const districts = await districtService.fetchDistrictsByCityId(cityId);
    res.status(200).json({
      success: true,
      message: '시/군/구 목록 조회 성공',
      data: districts
    });
  } catch (err) {
    logger.error('(districtRouter.fetchDistrictsByCityId)', {
      error: err.toString(),
      cityId
    });

    if (err instanceof AppError) {
      res.status(err.statusCode).json({
        success: false,
        message: err.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: '시/군/구 목록 조회 중 오류가 발생했습니다.'
      });
    }
  }
});

export default districtRouter;
