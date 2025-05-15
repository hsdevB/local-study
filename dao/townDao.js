import Town from '../models/town.js';
import logger from '../utils/logger.js';

const townDao = {
  getTownsByDistrictId: async (districtId) => {
    try {
      const towns = await Town.findAll({
        where: { district_id: districtId }
      });
      return towns;
    } catch (err) {
      logger.error(`Failed to fetch towns for districtId=${districtId}`, err);
      throw new Error(`Failed to fetch towns for districtId=${districtId}`);
    }
  }
};

export default townDao;
