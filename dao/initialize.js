// /dao/initialize.js
import City from '../models/city.js';
import District from '../models/district.js';
import Town from '../models/town.js';
import parseAddressTxtFilesAsNestedMap from '../utils/parseAddress.js'; // 수정된 주소 파싱 함수
import logger from '../utils/logger.js';

// 초기 데이터 삽입 함수
export async function initializeDatabase() {
  try {
    // 테이블에 데이터가 있는지 확인
    const cityCount = await City.count();
    const districtCount = await District.count();
    const townCount = await Town.count();

    // 데이터가 이미 있으면 초기화 건너뛰기
    if (cityCount > 0 && districtCount > 0 && townCount > 0) {
      logger.info("데이터가 이미 존재합니다. 초기화를 건너뜁니다.");
      return;
    }

    const addressMap = parseAddressTxtFilesAsNestedMap('public/data'); // 텍스트 파일을 파싱하여 시/도 → 구/군 → 읍/면/동 구조 얻기

    for (const cityName in addressMap) {
      // 시/도 데이터 삽입
      const city = await City.create({ name: cityName });
      logger.info(`${cityName} 시/도 데이터 삽입 완료.`);

      const districts = addressMap[cityName];
      for (const districtName in districts) {
        // 구/군 데이터 삽입
        const district = await District.create({
          name: districtName,
          city_id: city.id, // 시/도와 연결되는 외래키
        });
        logger.info(`${districtName} 구/군 데이터 삽입 완료.`);

        const towns = districts[districtName];
        for (const townName of towns) {
          // 읍/면/동 데이터 삽입
          await Town.create({
            name: townName,
            district_id: district.id, // 구/군과 연결되는 외래키
          });
          logger.info(`${townName} 읍/면/동 데이터 삽입 완료.`);
        }
      }
    }

    logger.info("Database initialized successfully!");
  } catch (error) {
    logger.error("Error initializing the database:", error);
  }
}
