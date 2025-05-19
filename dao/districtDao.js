import District from '../models/district.js';
import logger from '../utils/logger.js';
import { AppError } from '../utils/errorHandler.js';

const districtDao = {
  getDistrictsByCityId: async (cityId) => {
    try {
      const districts = await District.findAll({
        where: { city_id: cityId }
      });
      logger.info('(districtDao.getDistrictsByCityId) 시/군/구 목록 조회 완료', {
        cityId,
        count: districts.length,
        timestamp: new Date().toISOString()
      });
      return districts;
    } catch (err) {
      logger.error('(districtDao.getDistrictsByCityId) 시/군/구 목록 조회 실패', {
        error: err.toString(),
        cityId,
        timestamp: new Date().toISOString()
      });
      throw new AppError('시/군/구 목록 조회 중 오류가 발생했습니다.', 500);
    }
  }
};

export default districtDao;
