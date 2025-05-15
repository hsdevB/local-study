import cityDao from '../dao/cityDao.js';
import logger from '../utils/logger.js';

const cityService = {
  fetchAllCities: async () => {
    try {
      const cities = await cityDao.getAllCities();
      return cities.map(city => ({
        id: city.id,
        name: city.name
      }));
    } catch (error) {
      logger.error('Failed to fetch cities:', error);
      throw new Error('Could not fetch cities');
    }
  }
};

export default cityService;