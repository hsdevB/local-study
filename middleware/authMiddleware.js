import tokenUtil from '../utils/tokenUtil.js';
import tokenBlacklistDao from '../dao/tokenBlacklistDao.js';
import { AppError } from '../utils/errorHandler.js';
import logger from '../utils/logger.js';

const authMiddleware = {
    // 토큰 검증 미들웨어
    verifyToken: async (req, res, next) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            
            if (!token) {
                throw new AppError('인증 토큰이 필요합니다.', 401);
            }

            // 토큰이 블랙리스트에 있는지 확인
            const isBlacklisted = await tokenBlacklistDao.isBlacklisted(token);
            if (isBlacklisted) {
                throw new AppError('이미 로그아웃된 토큰입니다.', 401);
            }

            // 토큰 검증
            const decoded = await tokenUtil.verifyToken(token);
            req.user = decoded;

            logger.info('(authMiddleware.verifyToken)', {
                userId: decoded.userId,
                timestamp: new Date().toISOString()
            });

            next();
        } catch (err) {
            logger.error('(authMiddleware.verifyToken)', {
                error: err.toString()
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
    },

    // 관리자 권한 검증 미들웨어
    verifyAdmin: async (req, res, next) => {
        try {
            if (!req.user || req.user.role !== 'admin') {
                throw new AppError('관리자 권한이 필요합니다.', 403);
            }
            next();
        } catch (err) {
            logger.error('(authMiddleware.verifyAdmin)', {
                error: err.toString(),
                userId: req.user?.userId
            });

            if (err instanceof AppError) {
                res.status(err.statusCode).json({
                    success: false,
                    message: err.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: '권한 확인 중 오류가 발생했습니다.'
                });
            }
        }
    }
};

export default authMiddleware; 