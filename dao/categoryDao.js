import Category from '../models/category.js';
import logger from '../utils/logger.js';
import { AppError } from '../utils/errorHandler.js';

const categoryDao = {
    async getAllCategories() {
        try {
            const categories = await Category.findAll();
            logger.info('(categoryDao.getAllCategories)', {
                count: categories.length
            });
            return categories;
        } catch (err) {
            logger.error('(categoryDao.getAllCategories)', {
                error: err.toString()
            });
            throw new AppError('카테고리 목록 조회 중 오류가 발생했습니다.', 500);
        }
    }
};

export default categoryDao;