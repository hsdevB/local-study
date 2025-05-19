import TokenBlacklist from '../models/tokenBlacklist.js';
import { Op } from 'sequelize';
import logger from '../utils/logger.js';
import { AppError } from '../utils/errorHandler.js';
import tokenUtil from '../utils/tokenUtil.js';

const tokenBlacklistDao = {
    // 토큰을 블랙리스트에 추가
    async addToBlacklist(token, userId) {
        try {
            // 토큰에서 만료 시간 추출
            const decoded = await tokenUtil.verifyToken(token);
            const expiresAt = new Date(decoded.exp * 1000); // exp는 초 단위이므로 밀리초로 변환

            await TokenBlacklist.create({
                token,
                userId,
                expiresAt
            });

            logger.info('(tokenBlacklistDao.addToBlacklist)', {
                message: '토큰이 블랙리스트에 추가되었습니다.',
                userId
            });
        } catch (err) {
            logger.error('(tokenBlacklistDao.addToBlacklist)', {
                error: err.toString(),
                userId
            });
            throw new AppError('토큰 블랙리스트 추가 중 오류가 발생했습니다.', 500);
        }
    },

    // 토큰이 블랙리스트에 있는지 확인
    async isBlacklisted(token) {
        try {
            const blacklistedToken = await TokenBlacklist.findOne({
                where: {
                    token,
                    expiresAt: {
                        [Op.gt]: new Date()
                    }
                }
            });
            return !!blacklistedToken;
        } catch (err) {
            logger.error('(tokenBlacklistDao.isBlacklisted) 토큰 블랙리스트 확인 실패', {
                error: err.toString(),
                timestamp: new Date().toISOString()
            });
            throw new AppError('토큰 블랙리스트 확인 중 오류가 발생했습니다.', 500);
        }
    },

    // 만료된 토큰 삭제 (정기적인 정리 작업용)
    async removeExpiredTokens() {
        try {
            const result = await TokenBlacklist.destroy({
                where: {
                    expiresAt: {
                        [Op.lt]: new Date()
                    }
                }
            });

            logger.info('(tokenBlacklistDao.removeExpiredTokens) 만료된 토큰 삭제 완료', {
                removedCount: result,
                timestamp: new Date().toISOString()
            });

            return result;
        } catch (err) {
            logger.error('(tokenBlacklistDao.removeExpiredTokens) 만료된 토큰 삭제 실패', {
                error: err.toString(),
                timestamp: new Date().toISOString()
            });
            throw new AppError('만료된 토큰 삭제 중 오류가 발생했습니다.', 500);
        }
    }
};

export default tokenBlacklistDao; 