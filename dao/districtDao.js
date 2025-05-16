import District from '../models/district.js';
import logger from '../utils/logger.js';
import { AppError } from '../utils/errorHandler.js';

const districtDao = {
  getDistrictsByCityId: async (cityId) => {
    try {
      const districts = await District.findAll({
        where: { city_id: cityId }
      });
      logger.info('(districtDao.getDistrictsByCityId)', {
        cityId,
        count: districts.length
      });
      return districts;
    } catch (err) {
      logger.error('(districtDao.getDistrictsByCityId)', {
        error: err.toString(),
        cityId
      });
      throw new AppError('시/군/구 목록 조회 중 오류가 발생했습니다.', 500);
    }
  }
};

export default districtDao;
