import User from '../models/user.js';
import logger from '../utils/logger.js';
import { AppError } from '../utils/errorHandler.js';
import models from '../models/index.js';

const userDao = {
    async selectUser(params) {
        try {
            const user = await models.User.findOne({
                where: {
                    userId: params.userId
                },
                attributes: ['id', 'userId', 'password', 'nickname', 'email', 'phoneNumber', 'birthDate', 'gender']
            });

            logger.info('(userDao.selectUser) 사용자 조회 완료', {
                userId: params.userId,
                found: !!user,
                timestamp: new Date().toISOString()
            });

            return user;
        } catch (err) {
            logger.error('(userDao.selectUser) 사용자 조회 실패', {
                error: err.toString(),
                userId: params.userId,
                timestamp: new Date().toISOString()
            });
            throw err;
        }
    },
    
    findByUserId: async(userId) => {
        try {
            const user = await User.findOne({ 
                where: { userId },
                attributes: ['id', 'userId', 'nickname', 'email', 'phoneNumber', 'birthDate', 'gender']
            });
            return user;
        } catch (err) {
            logger.error('(userDao.findByUserId) 사용자 조회 실패', {
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
                where: { email },
                attributes: ['id', 'userId', 'email']
            });
            return user;
        } catch (err) {
            logger.error('(userDao.findByEmail) 이메일 조회 실패', {
                error: err.toString(),
                email,
                timestamp: new Date().toISOString()
            });
            throw new AppError('이메일 조회 중 오류가 발생했습니다.', 500);
        }
    },

    updatePassword: async(userId, hashedPassword) => {
        try {
            const [updatedCount] = await User.update(
                { password: hashedPassword },
                { where: { userId } }
            );

            if (updatedCount === 0) {
                throw new AppError('비밀번호 업데이트에 실패했습니다.', 500);
            }

            logger.info('(userDao.updatePassword) 비밀번호 변경 완료', {
                userId,
                timestamp: new Date().toISOString()
            });

            return true;
        } catch (err) {
            logger.error('(userDao.updatePassword) 비밀번호 변경 실패', {
                error: err.toString(),
                userId,
                timestamp: new Date().toISOString()
            });
            throw new AppError('비밀번호 업데이트 중 오류가 발생했습니다.', 500);
        }
    },

    updateUser: async(userId, updateData) => {
        try {
            const [updatedCount] = await User.update(
                updateData,
                { where: { userId } }
            );

            if (updatedCount === 0) {
                throw new AppError('회원정보 업데이트에 실패했습니다.', 500);
            }

            const updatedUser = await User.findOne({
                where: { userId },
                attributes: ['userId', 'email', 'username', 'phoneNumber', 'birthDate', 'gender']
            });

            logger.info('(userDao.updateUser) 회원정보 수정 완료', {
                userId,
                updatedFields: Object.keys(updateData),
                timestamp: new Date().toISOString()
            });

            return updatedUser;
        } catch (err) {
            logger.error('(userDao.updateUser) 회원정보 수정 실패', {
                error: err.toString(),
                userId,
                updateData,
                timestamp: new Date().toISOString()
            });
            throw new AppError('회원정보 업데이트 중 오류가 발생했습니다.', 500);
        }
    },

    deleteUser: async(userId) => {
        try {
            const deletedCount = await User.destroy({
                where: { userId }
            });

            if (deletedCount === 0) {
                throw new AppError('회원 탈퇴에 실패했습니다.', 500);
            }

            logger.info('(userDao.deleteUser) 회원 탈퇴 완료', {
                userId,
                timestamp: new Date().toISOString()
            });

            return true;
        } catch (err) {
            logger.error('(userDao.deleteUser) 회원 탈퇴 실패', {
                error: err.toString(),
                userId,
                timestamp: new Date().toISOString()
            });
            throw new AppError('회원 탈퇴 중 오류가 발생했습니다.', 500);
        }
    }
};

export default userDao;
