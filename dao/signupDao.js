import User from '../models/user.js';
import logger from '../utils/logger.js';
import { AppError } from '../utils/errorHandler.js';
import { Op } from 'sequelize';

const signupDao = {
    createUser: async(params) => {
        try {
            const user = await User.create(params);
            logger.info('(signupDao.createUser) 회원가입 완료', {
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
            // Sequelize unique constraint 에러 처리
            if (err.name === 'SequelizeUniqueConstraintError') {
                const errorField = err.errors[0].path;
                logger.error('(signupDao.createUser) 중복된 데이터로 인한 회원가입 실패', {
                    error: err.toString(),
                    field: errorField,
                    params: {
                        userId: params.userId,
                        email: params.email
                    },
                    timestamp: new Date().toISOString()
                });

                if (errorField === 'userId') {
                    throw new AppError('이미 사용 중인 아이디입니다.', 400);
                } else if (errorField === 'email') {
                    throw new AppError('이미 사용 중인 이메일입니다.', 400);
                }
            }

            logger.error('(signupDao.createUser) 회원가입 실패', {
                error: err.toString(),
                errorName: err.name,
                errorMessage: err.message,
                params: {
                    userId: params.userId,
                    email: params.email
                },
                timestamp: new Date().toISOString()
            });
            
            throw new AppError('사용자 생성 중 오류가 발생했습니다.', 500);
        }
    },
    findByUserId: async(userId) => {
        try {
            const user = await User.findOne({ 
                where: { 
                    userId,
                    deletedAt: null  // 탈퇴하지 않은 사용자만 체크
                },
                attributes: ['id', 'userId', 'email']
            });
            return user;
        } catch (err) {
            logger.error('(signupDao.findByUserId) 사용자 조회 실패', {
                error: err.toString(),
                userId,
                timestamp: new Date().toISOString()
            });
            throw new AppError('사용자 조회 중 오류가 발생했습니다.', 500);
        }
    },
    findByEmail: async(email) => {
        try {
            const user = await User.findOne({ 
                where: { 
                    email,
                    deletedAt: null  // 탈퇴하지 않은 사용자만 체크
                },
                attributes: ['id', 'userId', 'email']
            });
            return user;
        } catch (err) {
            logger.error('(signupDao.findByEmail) 이메일 조회 실패', {
                error: err.toString(),
                email,
                timestamp: new Date().toISOString()
            });
            throw new AppError('이메일 조회 중 오류가 발생했습니다.', 500);
        }
    }
};

export default signupDao;
