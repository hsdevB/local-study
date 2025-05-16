import TokenBlacklist from '../models/tokenBlacklist.js';
import { Op } from 'sequelize';
import logger from '../utils/logger.js';
import { AppError } from '../utils/errorHandler.js';

const tokenBlacklistDao = {
    // 토큰을 블랙리스트에 추가
    async addToBlacklist(token, userId, expiresAt) {
        try {
            await TokenBlacklist.create({
                token,
                userId,
                expiresAt
            });

            logger.info('(tokenBlacklistDao.addToBlacklist)', {
                userId,
                expiresAt: expiresAt.toISOString()
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
            logger.error('(tokenBlacklistDao.isBlacklisted)', {
                error: err.toString()
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

            logger.info('(tokenBlacklistDao.removeExpiredTokens)', {
                removedCount: result
            });

            return result;
        } catch (err) {
            logger.error('(tokenBlacklistDao.removeExpiredTokens)', {
                error: err.toString()
            });
            throw new AppError('만료된 토큰 삭제 중 오류가 발생했습니다.', 500);
        }
    }
};

export default tokenBlacklistDao; 