import tokenUtil from '../utils/tokenUtil.js';
import tokenBlacklistDao from '../dao/tokenBlacklistDao.js';
import { AppError } from '../utils/errorHandler.js';
import logger from '../utils/logger.js';

const authMiddleware = {
    // 토큰 검증 미들웨어
    verifyToken: async (req, res, next) => {
        try {
            // 쿠키와 Authorization 헤더에서 토큰 확인
            const token = req.headers.authorization?.split(' ')[1];
            
            if (!token || typeof token !== 'string') {
            logger.warn('(authMiddleware.verifyToken) 토큰 없음 또는 타입 오류', {
                path: req.path,
                timestamp: new Date().toISOString()
            });
            return res.status(401).json({ success: false, message: '인증이 필요한 서비스입니다.' });
            }

            // 토큰이 블랙리스트에 있는지 확인
            const isBlacklisted = await tokenBlacklistDao.isBlacklisted(token);
            if (isBlacklisted) {
                logger.warn('(authMiddleware.verifyToken) 블랙리스트된 토큰', {
                    path: req.path,
                    timestamp: new Date().toISOString()
                });
                throw new AppError('유효하지 않은 토큰입니다.', 401);
            }

            // 토큰 검증
            const decoded = await tokenUtil.verifyToken(token);
            req.user = decoded;

            logger.info('(authMiddleware.verifyToken) 토큰 인증 성공', {
                userId: decoded.userId,
                path: req.path,
                timestamp: new Date().toISOString()
            });

            next();
        } catch (err) {
            logger.error('(authMiddleware.verifyToken) 토큰 인증 실패', {
                error: err.toString(),
                path: req.path,
                timestamp: new Date().toISOString()
            });

            if (err instanceof AppError) {
                res.status(err.statusCode).json({
                    success: false,
                    message: err.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: '인증 처리 중 오류가 발생했습니다.'
                });
            }
        }
    }
};

export const verifyToken = authMiddleware.verifyToken;
export default authMiddleware; 