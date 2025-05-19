import districtDao from '../dao/districtDao.js';
import logger from '../utils/logger.js';
import { AppError } from '../utils/errorHandler.js';

const districtService = {
  fetchDistrictsByCityId: async (cityId) => {
    try {
      // 입력값 검증 및 변환
      const numericCityId = Number(cityId);
      if (!cityId || isNaN(numericCityId)) {
        throw new AppError('유효하지 않은 시/도 ID입니다.', 400);
      }

      const districts = await districtDao.getDistrictsByCityId(numericCityId);
      
      logger.info('(districtService.fetchDistrictsByCityId) 시/군/구 목록 조회 완료', {
        cityId: numericCityId,
        count: districts.length,
        timestamp: new Date().toISOString()
      });

      return districts.map(district => ({
        id: district.id,
        name: district.name,
        city_id: district.city_id
      }));
    } catch (err) {
      logger.error('(districtService.fetchDistrictsByCityId) 시/군/구 목록 조회 실패', {
        error: err.toString(),
        cityId,
        timestamp: new Date().toISOString()
      });
      throw err instanceof AppError ? err : new AppError('시/군/구 목록 조회 중 오류가 발생했습니다.', 500);
    }
  },
  async fetchDistrictsByCityIdHandler(req, res) {
    const { cityId } = req.params;
    try {
      if (!cityId) {
        return res.status(400).json({ success: false, message: '시/도 ID는 필수 입력값입니다.' });
      }

      // 입력값 검증 및 변환
      const numericCityId = Number(cityId);
      if (isNaN(numericCityId)) {
        throw new AppError('유효하지 않은 시/도 ID입니다.', 400);
      }

      const districts = await districtDao.getDistrictsByCityId(numericCityId);
      
      logger.info('(districtService.fetchDistrictsByCityIdHandler) 시/군/구 목록 조회 완료', {
        cityId: numericCityId,
        count: districts.length,
        timestamp: new Date().toISOString()
      });

      res.status(200).json({
        success: true,
        message: '시/군/구 목록 조회 성공',
        data: districts.map(district => ({
          id: district.id,
          name: district.name,
          city_id: district.city_id
        }))
      });
    } catch (err) {
      logger.error('(districtService.fetchDistrictsByCityIdHandler) 시/군/구 목록 조회 실패', {
        error: err.toString(),
        cityId,
        timestamp: new Date().toISOString()
      });
      res.status(500).json({
        success: false,
        message: '시/군/구 목록 조회 중 오류가 발생했습니다.'
      });
    }
  }
};

export default districtService;
