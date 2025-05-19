import townDao from '../dao/townDao.js';
import logger from '../utils/logger.js';
import { AppError } from '../utils/errorHandler.js';

const townService = {
  fetchTownsByDistrictId: async (districtId) => {
    try {
      // 입력값 검증 및 변환
      const numericDistrictId = Number(districtId);
      if (!districtId || isNaN(numericDistrictId)) {
        throw new AppError('유효하지 않은 시/군/구 ID입니다.', 400);
      }

      const towns = await townDao.getTownsByDistrictId(numericDistrictId);
      
      logger.info('(townService.fetchTownsByDistrictId) 읍/면/동 목록 조회 완료', {
        districtId: numericDistrictId,
        count: towns.length,
        timestamp: new Date().toISOString()
      });

      return towns.map(town => ({
        id: town.id,
        name: town.name,
        district_id: town.district_id
      }));
    } catch (err) {
      logger.error('(townService.fetchTownsByDistrictId) 읍/면/동 목록 조회 실패', {
        error: err.toString(),
        districtId,
        timestamp: new Date().toISOString()
      });
      throw err instanceof AppError ? err : new AppError('읍/면/동 목록 조회 중 오류가 발생했습니다.', 500);
    }
  }
};

export default townService;
