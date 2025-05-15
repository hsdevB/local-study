import { getAllCategories } from '../dao/categoryDao.js';
import logger from '../utils/logger.js';

const categoryService = {
    getAllCategories: async () => {
        try {
            const categories = await getAllCategories();
            return categories.map(category => ({
                id: category.id,
                name: category.name,
            }));
        } catch (error) {
            logger.error('Failed to fetch categories', error);
            throw new Error('Failed to fetch categories');
        }
    }
}

export default categoryService;