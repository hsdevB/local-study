import categoryDao from '../dao/categoryDao.js';
import logger from '../utils/logger.js';
import { AppError } from '../utils/errorHandler.js';

const categoryService = {
    getAllCategories: async () => {
        try {
            const categories = await categoryDao.getAllCategories();
            
            logger.info('(categoryService.getAllCategories) 카테고리 목록 조회 완료', {
                count: categories.length,
                timestamp: new Date().toISOString()
            });

            return categories.map(category => ({
                id: category.id,
                name: category.name,
            }));
        } catch (err) {
            logger.error('(categoryService.getAllCategories) 카테고리 목록 조회 실패', {
                error: err.toString(),
                timestamp: new Date().toISOString()
            });
            throw err instanceof AppError ? err : new AppError('카테고리 목록 조회 중 오류가 발생했습니다.', 500);
        }
    },
    getAllCategoriesHandler: async (req, res) => {
        try {
            const categories = await categoryService.getAllCategories();
            res.status(200).json({
                success: true,
                message: '카테고리 목록 조회 성공',
                data: categories
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: '카테고리 목록 조회 중 오류가 발생했습니다.'
            });
        }
    }
};

export default categoryService;