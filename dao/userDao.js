import User from '../models/user.js';
import logger from '../utils/logger.js';
import { AppError } from '../utils/errorHandler.js';

const userDao = {
    selectUser: async(params) => {
        try {
            const user = await User.findOne({ 
                where: { userId: params.userId },
                attributes: ['id', 'userId', 'password', 'email', 'username', 'createdAt', 'updatedAt']
            });
            return user;
        } catch (err) {
            logger.error('(userDao.selectUser)', {
                error: err.toString(),
                userId: params.userId
            });
            throw new AppError('사용자 조회 중 오류가 발생했습니다.', 500);
        }
    },
    
    findByUserId: async(userId) => {
        try {
            const user = await User.findOne({ 
                where: { userId },
                attributes: ['id', 'userId', 'password', 'email', 'username', 'phoneNumber', 'birthDate', 'gender']
            });
            return user;
        } catch (err) {
            logger.error('(userDao.findByUserId)', {
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
            logger.error('(userDao.findByEmail)', {
                error: err.toString(),
                email
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

            logger.info('(userDao.updatePassword)', {
                userId,
                timestamp: new Date().toISOString()
            });

            return true;
        } catch (err) {
            logger.error('(userDao.updatePassword)', {
                error: err.toString(),
                userId
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

            logger.info('(userDao.updateUser)', {
                userId,
                updatedFields: Object.keys(updateData),
                timestamp: new Date().toISOString()
            });

            return updatedUser;
        } catch (err) {
            logger.error('(userDao.updateUser)', {
                error: err.toString(),
                userId,
                updateData
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

            logger.info('(userDao.deleteUser)', {
                userId,
                timestamp: new Date().toISOString()
            });

            return true;
        } catch (err) {
            logger.error('(userDao.deleteUser)', {
                error: err.toString(),
                userId
            });
            throw new AppError('회원 탈퇴 중 오류가 발생했습니다.', 500);
        }
    }
};

export default userDao;
