import townDao from '../dao/townDao.js';
import logger from '../utils/logger.js';

const townService = {
  fetchTownsByDistrictId: async (districtId) => {
    try {
      const towns = await townDao.getTownsByDistrictId(districtId);
      return towns.map(town => ({
        id: town.id,
        name: town.name,
        district_id: town.district_id
      }));
    } catch (error) {
      logger.error(`Failed to fetch towns for districtId=${districtId}:`, error);
      throw new Error('Could not fetch towns');
    }
  }
};

export default townService;
