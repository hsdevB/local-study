import districtDao from '../dao/districtDao.js';
import logger from '../utils/logger.js';

const districtService = {
  fetchDistrictsByCityId: async (cityId) => {
    try {
      const districts = await districtDao.getDistrictsByCityId(cityId);
      return districts.map(district => ({
        id: district.id,
        name: district.name,
        city_id: district.city_id
      }));
    } catch (error) {
      logger.error(`Failed to fetch districts for cityId=${cityId}:`, error);
      throw new Error('Could not fetch districts');
    }
  }
};

export default districtService;
