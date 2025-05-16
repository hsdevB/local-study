import City from '../models/city.js';
import District from '../models/district.js';
import Town from '../models/town.js';
import parseAddressTxtFilesAsNestedMap from '../utils/parseAddress.js';
import logger from '../utils/logger.js';
import { AppError } from '../utils/errorHandler.js';

// 초기 데이터 삽입 함수
export async function initializeAddressData() {
  try {
    // 테이블에 데이터가 있는지 확인
    const cityCount = await City.count();
    const districtCount = await District.count();
    const townCount = await Town.count();

    // 데이터가 이미 있으면 초기화 건너뛰기
    if (cityCount > 0 && districtCount > 0 && townCount > 0) {
      logger.info('(initializeAddressData)', {
        message: '데이터가 이미 존재합니다. 초기화를 건너뜁니다.',
        counts: { cityCount, districtCount, townCount }
      });
      return;
    }

    const addressMap = parseAddressTxtFilesAsNestedMap('public/data');
    let insertedCityCount = 0;
    let insertedDistrictCount = 0;
    let insertedTownCount = 0;

    for (const cityName in addressMap) {
      try {
        // 시/도 데이터 삽입
        const city = await City.create({ name: cityName });
        insertedCityCount++;

        const districts = addressMap[cityName];
        for (const districtName in districts) {
          try {
            // 구/군 데이터 삽입
            const district = await District.create({
              name: districtName,
              city_id: city.id,
            });
            insertedDistrictCount++;

            const towns = districts[districtName];
            for (const townName of towns) {
              try {
                // 읍/면/동 데이터 삽입
                await Town.create({
                  name: townName,
                  district_id: district.id,
                });
                insertedTownCount++;
              } catch (err) {
                logger.error('(initializeAddressData)', {
                  error: err.toString(),
                  type: 'town',
                  name: townName,
                  district: districtName
                });
                throw new AppError(`읍/면/동 "${townName}" 초기화 중 오류가 발생했습니다.`, 500);
              }
            }
          } catch (err) {
            logger.error('(initializeAddressData)', {
              error: err.toString(),
              type: 'district',
              name: districtName,
              city: cityName
            });
            throw new AppError(`시/군/구 "${districtName}" 초기화 중 오류가 발생했습니다.`, 500);
          }
        }
      } catch (err) {
        logger.error('(initializeAddressData)', {
          error: err.toString(),
          type: 'city',
          name: cityName
        });
        throw new AppError(`시/도 "${cityName}" 초기화 중 오류가 발생했습니다.`, 500);
      }
    }

    logger.info('(initializeAddressData)', {
      message: '주소 데이터 초기화 완료',
      counts: {
        cities: insertedCityCount,
        districts: insertedDistrictCount,
        towns: insertedTownCount
      }
    });
  } catch (err) {
    logger.error('(initializeAddressData)', {
      error: err.toString()
    });
    throw new AppError('주소 데이터 초기화 중 오류가 발생했습니다.', 500);
  }
}
