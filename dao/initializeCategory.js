import { loadCategoriesFromJson } from '../utils/loadCategories.js';
import Category from '../models/category.js';
import logger from '../utils/logger.js';
import { AppError } from '../utils/errorHandler.js';

export async function initializeCategory() {
    try {
        const categories = loadCategoriesFromJson();
        let insertedCount = 0;
        let skippedCount = 0;
    
        for (const category of categories) {
            try {
                // 이미 존재하는지 확인
                const existing = await Category.findOne({ where: { name: category.name } });
        
                if (existing) {
                    logger.info('(initializeCategory)', {
                        message: `Category "${category.name}" already exists. Skipping.`
                    });
                    skippedCount++;
                    continue;
                }
        
                // 존재하지 않으면 생성
                await Category.create({ name: category.name });
                logger.info('(initializeCategory)', {
                    message: `Inserted category: ${category.name}`
                });
                insertedCount++;
            } catch (err) {
                logger.error('(initializeCategory)', {
                    error: err.toString(),
                    category: category.name
                });
                throw new AppError(`카테고리 "${category.name}" 초기화 중 오류가 발생했습니다.`, 500);
            }
        }
    
        logger.info('(initializeCategory)', {
            message: '카테고리 데이터 초기화 완료',
            insertedCount,
            skippedCount
        });
    } catch (err) {
        logger.error('(initializeCategory)', {
            error: err.toString()
        });
        throw new AppError('카테고리 데이터 초기화 중 오류가 발생했습니다.', 500);
    }
}