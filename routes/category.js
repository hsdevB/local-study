import express from 'express';
import categoryService from '../service/categoryService.js';
import logger from '../utils/logger.js';
import { AppError } from '../utils/errorHandler.js';

const categoryRouter = express.Router();

// GET /categories
categoryRouter.get('/', async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.status(200).json({
      success: true,
      message: '카테고리 목록 조회 성공',
      data: categories
    });
  } catch (err) {
    logger.error('(categoryRouter.getAllCategories)', {
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
        message: '카테고리 목록 조회 중 오류가 발생했습니다.'
      });
    }
  }
});

export default categoryRouter;