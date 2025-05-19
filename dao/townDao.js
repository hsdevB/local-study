import Town from '../models/town.js';
import logger from '../utils/logger.js';
import { AppError } from '../utils/errorHandler.js';

const townDao = {
  getTownsByDistrictId: async (districtId) => {
    try {
      const towns = await Town.findAll({
        where: { district_id: districtId }
      });
      logger.info('(townDao.getTownsByDistrictId) 읍/면/동 목록 조회 완료', {
        districtId,
        count: towns.length,
        timestamp: new Date().toISOString()
      });
      return towns;
    } catch (err) {
      logger.error('(townDao.getTownsByDistrictId) 읍/면/동 목록 조회 실패', {
        error: err.toString(),
        districtId,
        timestamp: new Date().toISOString()
      });
      throw new AppError('읍/면/동 목록 조회 중 오류가 발생했습니다.', 500);
    }
  }
};

export default townDao;
