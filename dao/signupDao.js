import User from '../models/user.js';
import logger from '../utils/logger.js';
import { AppError } from '../utils/errorHandler.js';

const signupDao = {
    createUser: async(params) => {
        try {
            const user = await User.create(params);
            logger.info('(signupDao.createUser)', {
                userId: params.userId,
                email: params.email,
                timestamp: new Date().toISOString()
            });
            return {
                id: user.id,
                userId: user.userId,
                email: user.email,
                username: user.username,
                createdAt: user.createdAt
            };
        } catch (err) {
            logger.error('(signupDao.createUser)', {
                error: err.toString(),
                params: {
                    userId: params.userId,
                    email: params.email
                }
            });
            throw new AppError('사용자 생성 중 오류가 발생했습니다.', 500);
        }
    },
    findByUserId: async(userId) => {
        try {
            const user = await User.findOne({ 
                where: { userId },
                attributes: ['id', 'userId', 'email']
            });
            return user;
        } catch (err) {
            logger.error('(signupDao.findByUserId)', {
                error: err.toString(),
                userId
            });
            throw new AppError('사용자 조회 중 오류가 발생했습니다.', 500);
        }
    },
    findByEmail: async(email) => {
        try {
            const user = await User.findOne({ 
                where: { email },
                attributes: ['id', 'userId', 'email']
            });
            return user;
        } catch (err) {
            logger.error('(signupDao.findByEmail)', {
                error: err.toString(),
                email
            });
            throw new AppError('이메일 조회 중 오류가 발생했습니다.', 500);
        }
    }
};

export default signupDao;
