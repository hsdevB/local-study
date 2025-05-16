import { loadCategoriesFromJson } from '../utils/loadCategories.js';
import Category from '../models/category.js';
import logger from '../utils/logger.js';

export async function initializeCategory() {
    try {
        const categories = loadCategoriesFromJson();
    
        for (const category of categories) {
          // 이미 존재하는지 확인
          const existing = await Category.findOne({ where: { name: category.name } });
    
          if (existing) {
            logger.info(`Category "${category.name}" already exists. Skipping.`);
            continue;
          }
    
          // 존재하지 않으면 생성
          await Category.create({ name: category.name });
          logger.info(`Inserted category: ${category.name}`);
        }
    
        logger.info('✅ 카테고리 데이터 초기화 완료.');
      } catch (err) {
        logger.error('❌ 카테고리 데이터 초기화 실패:', err);
      }
}