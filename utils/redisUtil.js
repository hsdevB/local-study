import Redis from 'ioredis';
import logger from './logger.js';
import { AppError } from './errorHandler.js';

const redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    }
});

redisClient.on('error', (err) => {
    logger.error('(redisUtil) Redis connection error:', err);
});

redisClient.on('connect', () => {
    logger.info('(redisUtil) Redis connected successfully');
});

const redisUtil = {
    // 토큰을 블랙리스트에 추가
    async addToBlacklist(token, expirationTime) {
        try {
            await redisClient.set(`blacklist:${token}`, '1', 'EX', expirationTime);
            logger.info('(redisUtil.addToBlacklist)', {
                token: token.substring(0, 10) + '...',
                expirationTime
            });
        } catch (err) {
            logger.error('(redisUtil.addToBlacklist)', {
                error: err.toString()
            });
            throw new AppError('토큰 블랙리스트 추가 중 오류가 발생했습니다.', 500);
        }
    },

    // 토큰이 블랙리스트에 있는지 확인
    async isBlacklisted(token) {
        try {
            const result = await redisClient.get(`blacklist:${token}`);
            return result === '1';
        } catch (err) {
            logger.error('(redisUtil.isBlacklisted)', {
                error: err.toString()
            });
            throw new AppError('토큰 블랙리스트 확인 중 오류가 발생했습니다.', 500);
        }
    },

    // 토큰을 블랙리스트에서 제거
    async removeFromBlacklist(token) {
        try {
            await redisClient.del(`blacklist:${token}`);
            logger.info('(redisUtil.removeFromBlacklist)', {
                token: token.substring(0, 10) + '...'
            });
        } catch (err) {
            logger.error('(redisUtil.removeFromBlacklist)', {
                error: err.toString()
            });
            throw new AppError('토큰 블랙리스트 제거 중 오류가 발생했습니다.', 500);
        }
    }
};

export default redisUtil; 