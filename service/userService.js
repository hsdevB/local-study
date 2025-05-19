import userDao from '../dao/userDao.js';
import hashUtil from '../utils/hashUtil.js';
import tokenUtil from '../utils/tokenUtil.js';
import tokenBlacklistDao from '../dao/tokenBlacklistDao.js';
import logger from '../utils/logger.js';
import { AppError } from '../utils/errorHandler.js';
import validationUtil from '../utils/validationUtil.js';

const userService = {
    async login(params) {
        try {
            // 0. 입력 파라미터 검증
            if (!params || typeof params !== 'object') {
                throw new Error('잘못된 요청 형식입니다.');
            }
            
            if (!params.userId || typeof params.userId !== 'string') {
                throw new Error('사용자 ID는 필수 입력값입니다.');
            }

            if (!params.password || typeof params.password !== 'string') {
                throw new Error('비밀번호는 필수 입력값입니다.');
            }

            // 보안을 위한 로깅 - 로그인 시도
            logger.info('(userService.login) 로그인 시도', {
                userId: params.userId,
                timestamp: new Date().toISOString(),
                ip: params.ip || 'unknown',
                userAgent: params.userAgent || 'unknown'
            });

            // 1. 사용자 조회
            const userInfo = await userDao.selectUser(params);

            // 1-1. 사용자 존재 여부 확인
            if (!userInfo) {
                const err = new Error(`${params.userId} 의 계정정보가 존재하지 않습니다.`);
                logger.error('(userService.login) 로그인 실패 - 존재하지 않는 계정', err.toString());
                // 보안을 위한 로깅 - 존재하지 않는 계정 로그인 시도
                logger.warn('(userService.login) 로그인 실패 - 존재하지 않는 계정', {
                    userId: params.userId,
                    timestamp: new Date().toISOString(),
                    ip: params.ip || 'unknown'
                });
                throw err;
            }

            // 2. 비밀번호 검증
            const checkPassword = await hashUtil.checkPasswordHash(
                params.password,
                userInfo.password
            );

            if (!checkPassword) {
                const err = new Error("입력하신 비밀번호가 일치하지않습니다.");
                logger.error('(userService.login) 로그인 실패 - 비밀번호 불일치', {
                    error: "입력하신 비밀번호가 일치하지않습니다.",
                    userId: params.userId,
                    timestamp: new Date().toISOString(),
                    ip: params.ip || 'unknown'
                });
                throw err;
            }

            // 3. jwt 토큰 발급
            const result = tokenUtil.makeToken(userInfo);
            
            // 보안을 위한 로깅 - 성공적인 로그인
            logger.info('(userService.login) 로그인 성공', {
                userId: params.userId,
                timestamp: new Date().toISOString(),
                ip: params.ip || 'unknown'
            });
            
            logger.debug('(userService.login) 로그인 디버그 정보', params, result);
            return result;
        } catch (err) {
            logger.error('(userService.login) 로그인 처리 중 오류 발생', {
                error: err.message,
                userId: params?.userId,
                timestamp: new Date().toISOString(),
                ip: params?.ip || 'unknown'
            });
            throw err;
        }
    },

    async changePassword(userId, currentPassword, newPassword) {
        try {
            // 1. 사용자 조회
            const user = await userDao.findByUserId(userId);
            if (!user) {
                throw new AppError('사용자를 찾을 수 없습니다.', 404);
            }

            // 2. 현재 비밀번호 확인
            const isPasswordValid = await hashUtil.checkPasswordHash(currentPassword, user.password);
            if (!isPasswordValid) {
                throw new AppError('현재 비밀번호가 일치하지 않습니다.', 400);
            }

            // 3. 새 비밀번호 유효성 검사
            validationUtil.validatePassword(newPassword);

            // 4. 새 비밀번호 해싱
            const hashedPassword = await hashUtil.makePasswordHash(newPassword);

            // 5. 비밀번호 업데이트
            await userDao.updatePassword(userId, hashedPassword);

            logger.info('(userService.changePassword) 비밀번호 변경 완료', {
                userId,
                timestamp: new Date().toISOString()
            });

            return { message: '비밀번호가 성공적으로 변경되었습니다.' };
        } catch (err) {
            logger.error('(userService.changePassword) 비밀번호 변경 실패', {
                error: err.toString(),
                userId
            });
            throw err;
        }
    },

    async updateUserInfo(userId, updateData) {
        try {
            // 1. 사용자 조회
            const user = await userDao.findByUserId(userId);
            if (!user) {
                throw new AppError('사용자를 찾을 수 없습니다.', 404);
            }

            // 2. 이메일 변경 시 중복 검사
            if (updateData.email && updateData.email !== user.email) {
                validationUtil.validateEmail(updateData.email);
                const existingEmail = await userDao.findByEmail(updateData.email);
                if (existingEmail) {
                    throw new AppError('이미 사용 중인 이메일입니다.', 400);
                }
            }

            // 3. 전화번호 형식 검사
            if (updateData.phoneNumber) {
                const phoneRegex = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/;
                if (!phoneRegex.test(updateData.phoneNumber)) {
                    throw new AppError('올바른 전화번호 형식이 아닙니다.', 400);
                }
            }

            // 4. 사용자 정보 업데이트
            const updatedUser = await userDao.updateUser(userId, updateData);

            logger.info('(userService.updateUserInfo) 회원정보 수정 완료', {
                userId,
                updatedFields: Object.keys(updateData),
                timestamp: new Date().toISOString()
            });

            return {
                message: '회원정보가 성공적으로 수정되었습니다.',
                data: {
                    userId: updatedUser.userId,
                    email: updatedUser.email,
                    username: updatedUser.username,
                    phoneNumber: updatedUser.phoneNumber
                }
            };
        } catch (err) {
            logger.error('(userService.updateUserInfo) 회원정보 수정 실패', {
                error: err.toString(),
                userId,
                updateData
            });
            throw err;
        }
    },

    async withdrawUser(userId, password) {
        try {
            // 1. 사용자 조회
            const user = await userDao.findByUserId(userId);
            if (!user) {
                throw new AppError('사용자를 찾을 수 없습니다.', 404);
            }

            // 2. 비밀번호 확인
            const isPasswordValid = await hashUtil.checkPasswordHash(password, user.password);
            if (!isPasswordValid) {
                throw new AppError('비밀번호가 일치하지 않습니다.', 400);
            }

            // 3. 회원 탈퇴 처리
            await userDao.deleteUser(userId);

            logger.info('(userService.withdrawUser) 회원 탈퇴 완료', {
                userId,
                timestamp: new Date().toISOString()
            });

            return { message: '회원 탈퇴가 완료되었습니다.' };
        } catch (err) {
            logger.error('(userService.withdrawUser) 회원 탈퇴 실패', {
                error: err.toString(),
                userId
            });
            throw err;
        }
    },

    logout: async(userId, token) => {
        try {
            // 토큰 블랙리스트에 추가
            if (token) {
                await tokenBlacklistDao.addToBlacklist(token, userId);
            }

            logger.info('(userService.logout) 로그아웃 성공', {
                userId,
                timestamp: new Date().toISOString()
            });
            return { message: '로그아웃되었습니다.' };
        } catch (err) {
            logger.error('(userService.logout) 로그아웃 실패', {
                error: err.toString(),
                userId,
                timestamp: new Date().toISOString()
            });
            throw new AppError('로그아웃 중 오류가 발생했습니다.', 500);
        }
    }
};

export default userService;