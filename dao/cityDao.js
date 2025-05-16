import City from '../models/city.js';

const cityDao = {
  getAllCities: async () => {
    try {
      const cities = await City.findAll();
      return cities;
    } catch (err) {
      throw new Error('Failed to fetch cities');
    }
  }
};

export default cityDao;