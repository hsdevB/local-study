/**
 * 비동기 함수의 에러를 처리하는 래퍼 함수
 * @param {Function} fn - 비동기 함수
 * @returns {Function} Express 미들웨어 함수
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler; 