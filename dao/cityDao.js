import City from '../models/city.js';
import logger from '../utils/logger.js';
const cityDao = {
  getAllCities: async () => {
    try {
      const cities = await City.findAll();
      return cities;
    } catch (err) {
      logger.error('Failed to fetch cities', err);
      throw new Error('Failed to fetch cities');
    }
  }
};

export default cityDao;