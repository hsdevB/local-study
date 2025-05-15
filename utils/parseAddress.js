// /utils/parseAddress.js
import fs from 'fs';
import path from 'path';
import iconv from 'iconv-lite';

/**
 * 텍스트 파일들을 파싱하여
 * 시/도 → 구/군 → 읍면동 구조로 정리된 객체 반환
 */
function parseAddressTxtFilesAsNestedMap(dirPath) {
  const fullDirPath = path.join(__dirname, '..', dirPath);
  const files = fs.readdirSync(fullDirPath);

  const map = {};

  files.forEach(file => {
    if (
      path.extname(file) === '.txt' &&
      file.startsWith('jibun_rnaddrkor_')
    ) {
      const buffer = fs.readFileSync(path.join(fullDirPath, file));
      const content = iconv.decode(buffer, 'euc-kr');
      const lines = content.split('\n').filter(line => line.trim() !== '');

      lines.forEach(line => {
        const fields = line.split('|');
        if (fields.length >= 5) {
          const city = fields[2].trim();       // 시/도
          const district = fields[3].trim();   // 구/군 (없으면 시/도와 동일 처리)
          const town = fields[4].trim();       // 읍면동

          const districtKey = district || city;

          if (!map[city]) {
            map[city] = {};
          }

          if (!map[city][districtKey]) {
            map[city][districtKey] = new Set();
          }

          map[city][districtKey].add(town);
        }
      });
    }
  });

  // Set → 배열로 변환
  const result = {};
  for (const [city, districts] of Object.entries(map)) {
    result[city] = {};
    for (const [district, towns] of Object.entries(districts)) {
      result[city][district] = Array.from(towns);
    }
  }

  return result;
}

export default {
  parseAddressTxtFilesAsNestedMap,
};

// --------------------------
// 단독 실행 시 테스트
// --------------------------
// if (require.main === module) {
//   const result = parseAddressTxtFilesAsNestedMap('public/data');
//   // console.log(JSON.stringify(result, null, 2));

//   // 결과를 JSON 형태로 변환하여 텍스트 파일로 저장
//   const filePath = path.join(__dirname, '.', 'result.txt'); // 결과를 저장할 파일 경로
//   const jsonResult = JSON.stringify(result, null, 2);  // JSON 포맷으로 변환
  
//   // 파일에 결과 저장
//   fs.writeFileSync(filePath, jsonResult, 'utf8');
//   console.log(`Results have been written to ${filePath}`);
// }
