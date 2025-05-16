import crypto from "crypto-js";
import dotenv from "dotenv";

dotenv.config();

const hashUtil = {
  generateSalt(length = 16) {
    return crypto.lib.WordArray.random(length).toString(crypto.enc.Base64);
  },

  makePasswordHash(password) {
    return new Promise((resolve, reject) => {

      const salt = this.generateSalt();
      const hash = crypto
        .PBKDF2(password, salt, {
          keySize: 256 / 32,
          iterations: process.env.HASHITERATION
            ? parseInt(process.env.HASHITERATION)
            : 10000,
        })
        .toString(crypto.enc.Base64);

      const result = `${salt}.${hash}`;
      // 암호화된 hash return 해주기
      resolve(result);
    });
  },

  checkPasswordHash(password, encryptedPassword) {
    return new Promise((resolve, reject) => {
      // 1. password, encrypedPassword 값을 둘 다 받았는지 체크
      if (!password || !encryptedPassword) {
        reject(new Error("Password, encryptedPassword는 필수값입니다."));
      }
      // 2. encryptedPassword 값에서 salt, hash 값 분리
      const splitResult = encryptedPassword.split(".");
      const salt = splitResult[0];
      const hash = splitResult[1];

      // 3. 사용자가 입력한 password 값에 salt 붙여서 hash 똑같이 돌림
      const newHash = crypto
        .PBKDF2(password, salt, {
          keySize: 256 / 32,
          iterations: process.env.HASHITERATION
            ? parseInt(process.env.HASHITERATION)
            : 10000,
        })
        .toString(crypto.enc.Base64);

      // 4. hash 함수 돌려서 나온 문자열이랑 encrypedPassword 안에 hash값이랑 같은 지 확인
      if (newHash === hash) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  },
};

export default hashUtil;
