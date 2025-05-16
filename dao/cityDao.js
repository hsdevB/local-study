import City from '../models/city.js';
import logger from '../utils/logger.js';
import { AppError } from '../utils/errorHandler.js';

const cityDao = {
  getAllCities: async () => {
    try {
      const cities = await City.findAll();
      logger.info('(cityDao.getAllCities)', {
        count: cities.length
      });
      return cities;
    } catch (err) {
      logger.error('(cityDao.getAllCities)', {
        error: err.toString()
      });
      throw new AppError('시/도 목록 조회 중 오류가 발생했습니다.', 500);
    }
  }
};

export default cityDao;