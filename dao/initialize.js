// /dao/initialize.js
import City from '../models/city.js';
import District from '../models/district.js';
import Town from '../models/town.js';
import parseAddressTxtFilesAsNestedMap from '../utils/parseAddress.js'; // 수정된 주소 파싱 함수

// 초기 데이터 삽입 함수
async function initializeDatabase() {
  try {
    const addressMap = parseAddressTxtFilesAsNestedMap('public/data'); // 텍스트 파일을 파싱하여 시/도 → 구/군 → 읍/면/동 구조 얻기

    for (const cityName in addressMap) {
      // 시/도 데이터 삽입
      const city = await City.create({ name: cityName });
      console.log(`${cityName} 시/도 데이터 삽입 완료.`);

      const districts = addressMap[cityName];
      for (const districtName in districts) {
        // 구/군 데이터 삽입
        const district = await District.create({
          name: districtName,
          city_id: city.id, // 시/도와 연결되는 외래키
        });
        console.log(`${districtName} 구/군 데이터 삽입 완료.`);

        const towns = districts[districtName];
        for (const townName of towns) {
          // 읍/면/동 데이터 삽입
          await Town.create({
            name: townName,
            district_id: district.id, // 구/군과 연결되는 외래키
          });
          console.log(`${townName} 읍/면/동 데이터 삽입 완료.`);
        }
      }
    }

    console.log("Database initialized successfully!");
  } catch (error) {
    console.error("Error initializing the database:", error);
  }
}

export default initializeDatabase;
