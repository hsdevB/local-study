import District from '../models/district.js';

const districtDao = {
  getDistrictsByCityId: async (cityId) => {
    try {
      const districts = await District.findAll({
        where: { city_id: cityId }
      });
      return districts;
    } catch (err) {
      throw new Error(`Failed to fetch districts for cityId=${cityId}`);
    }
  }
};

export default districtDao;
