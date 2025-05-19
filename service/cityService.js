import cityDao from '../dao/cityDao.js';
import logger from '../utils/logger.js';
import { AppError } from '../utils/errorHandler.js';

const cityService = {
  fetchAllCities: async () => {
    try {
      const cities = await cityDao.getAllCities();
      
      logger.info('(cityService.fetchAllCities) 시/도 목록 조회 완료', {
        count: cities.length,
        timestamp: new Date().toISOString()
      });

      return cities.map(city => ({
        id: city.id,
        name: city.name
      }));
    } catch (err) {
      logger.error('(cityService.fetchAllCities) 시/도 목록 조회 실패', {
        error: err.toString(),
        timestamp: new Date().toISOString()
      });
      throw err instanceof AppError ? err : new AppError('시/도 목록 조회 중 오류가 발생했습니다.', 500);
    }
  }
};

export default cityService;