import categoryDao from '../dao/categoryDao.js';
import logger from '../utils/logger.js';
import { AppError } from '../utils/errorHandler.js';

const categoryService = {
    getAllCategories: async () => {
        try {
            const categories = await categoryDao.getAllCategories();
            
            logger.info('(categoryService.getAllCategories)', {
                count: categories.length
            });

            return categories.map(category => ({
                id: category.id,
                name: category.name,
            }));
        } catch (err) {
            logger.error('(categoryService.getAllCategories)', {
                error: err.toString()
            });
            throw err instanceof AppError ? err : new AppError('카테고리 목록 조회 중 오류가 발생했습니다.', 500);
        }
    }
};

export default categoryService;