import userDao from '../dao/userDao.js';
import hashUtil from '../utils/hashUtil.js';
import tokenUtil from '../utils/tokenUtil.js';
import tokenBlacklistDao from '../dao/tokenBlacklistDao.js';
import logger from '../utils/logger.js';
import { AppError } from '../utils/errorHandler.js';
import validationUtil from '../utils/validationUtil.js';
import signupDao from '../dao/signupDao.js';

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
            const result = await tokenUtil.makeToken(userInfo);
            
            // 보안을 위한 로깅 - 성공적인 로그인
            logger.info('(userService.login) 로그인 성공', {
                userId: params.userId,
                timestamp: new Date().toISOString(),
                ip: params.ip || 'unknown'
            });
            
            return {
                token: result,
                userId: userInfo.userId,
                nickname: userInfo.nickname
            };
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
            logger.info('(userService.updateUserInfo) 회원정보 수정 시작', {
                userId,
                updateData,
                timestamp: new Date().toISOString()
            });

            // 1. 사용자 조회
            const user = await userDao.findByUserId(userId);
            if (!user) {
                throw new AppError('사용자를 찾을 수 없습니다.', 404);
            }

            // 2. 변경할 데이터가 있는지 확인
            if (Object.keys(updateData).length === 0) {
                logger.warn('(userService.updateUserInfo) 수정할 정보 없음', {
                    userId,
                    updateData,
                    timestamp: new Date().toISOString()
                });
                throw new AppError('수정할 정보가 없습니다.', 400);
            }

            // 3. 이메일 변경 시 중복 검사
            if (updateData.email && updateData.email !== user.email) {
                validationUtil.validateEmail(updateData.email);
                const existingEmail = await userDao.findByEmail(updateData.email);
                if (existingEmail) {
                    throw new AppError('이미 사용 중인 이메일입니다.', 400);
                }
            }

            // 4. 닉네임 중복 검사
            if (updateData.nickname && updateData.nickname !== user.nickname) {
                const existingNickname = await signupDao.findByNickname(updateData.nickname);
                if (existingNickname) {
                    throw new AppError('이미 사용 중인 닉네임입니다.', 400);
                }
            }

            // 5. 비밀번호 변경 시 해싱
            if (updateData.password) {
                updateData.password = await hashUtil.makePasswordHash(updateData.password);
            }

            // 6. 사용자 정보 업데이트
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
                    nickname: updatedUser.nickname
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
    },

    async loginHandler(req, res) {
        try {
            const { userId, password } = req.body;
            
            // 입력값 검증
            if (!userId || !password) {
                logger.warn('(userService.loginHandler) 로그인 실패 - 필수 입력값 누락', {
                    userId: userId || 'not provided',
                    timestamp: new Date().toISOString()
                });
                return res.status(400).json({ 
                    success: false, 
                    message: '사용자 ID와 비밀번호는 필수 입력값입니다.' 
                });
            }

            const loginParams = {
                userId,
                password,
                ip: req.ip,
                userAgent: req.get('user-agent')
            };

            logger.info('(userService.loginHandler) 로그인 시도', {
                userId,
                timestamp: new Date().toISOString(),
                ip: req.ip
            });

            const result = await this.login(loginParams);

            res.status(200).json({ 
                success: true, 
                message: '로그인 성공', 
                data: {
                    token: result.token,
                    userId: result.userId,
                    nickname: result.nickname
                }
            });
        } catch (err) {
            logger.error('(userService.loginHandler) 로그인 처리 중 오류 발생', {
                error: err.message,
                stack: err.stack,
                timestamp: new Date().toISOString()
            });

            // 클라이언트에 적절한 에러 메시지 전달
            const statusCode = err.status || 500;
            const message = err.message || '로그인 처리 중 오류가 발생했습니다.';
            
            res.status(statusCode).json({ 
                success: false, 
                message: message 
            });
        }
    },
    async changePasswordHandler(req, res) {
        try {
            const userId = req.user.userId;
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                return res.status(400).json({ success: false, message: '현재 비밀번호와 새 비밀번호는 필수 입력값입니다.' });
            }
            const result = await this.changePassword(userId, currentPassword, newPassword);
            res.status(200).json({ success: true, message: result.message });
        } catch (err) {
            res.status(500).json({ success: false, message: '비밀번호 변경 중 오류가 발생했습니다.' });
        }
    },
    async updateUserInfoHandler(req, res) {
        try {
            const userId = req.user.userId;
            const updateData = { ...req.body };
            
            // userId가 변경되는 경우를 처리
            if (updateData.userId && updateData.userId !== userId) {
                // userId 중복 검사
                const existingUser = await userDao.findByUserId(updateData.userId);
                if (existingUser) {
                    return res.status(400).json({ 
                        success: false, 
                        message: '이미 사용 중인 아이디입니다.' 
                    });
                }
            }

            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: '수정할 정보가 없습니다.' 
                });
            }

            const result = await this.updateUserInfo(userId, updateData);
            res.status(200).json({ 
                success: true, 
                message: result.message, 
                data: result.data 
            });
        } catch (err) {
            logger.error('(userService.updateUserInfoHandler) 회원정보 수정 실패', {
                error: err.toString(),
                userId: req.user.userId,
                updateData: req.body
            });
            res.status(err.status || 500).json({ 
                success: false, 
                message: err.message || '회원정보 수정 중 오류가 발생했습니다.' 
            });
        }
    },
    async withdrawUserHandler(req, res) {
        try {
            const { userId, password } = req.body;
            if (!userId || !password) {
                return res.status(400).json({ success: false, message: '사용자 ID와 비밀번호는 필수 입력값입니다.' });
            }
            const result = await this.withdrawUser(userId, password);
            res.status(200).json({ success: true, message: result.message });
        } catch (err) {
            res.status(500).json({ success: false, message: '회원 탈퇴 중 오류가 발생했습니다.' });
        }
    },
    async logoutHandler(req, res, next) {
        try {
            const { userId } = req.user;
            const token = req.headers.authorization?.split(' ')[1];
            await this.logout(userId, token);
            res.status(200).json({ success: true, message: '로그아웃되었습니다.' });
        } catch (err) {
            next(err);
        }
    },
    getUserProfile: async (req, res) => {
        try {
            if (!req.user) {
                // 반드시 응답을 내려줌
                return res.status(401).json({ success: false, message: '로그인이 필요한 서비스입니다.' });
            }
            const user = await userDao.findByUserId(req.user.userId);
            if (!user) {
                return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
            }
            res.status(200).json({
                success: true,
                data: {
                    id: user.id,
                    userId: user.userId,
                    nickname: user.nickname,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    birthDate: user.birthDate,
                    gender: user.gender
                }
            });
        } catch (err) {
            // 반드시 에러 응답을 내려줌
            res.status(500).json({ success: false, message: '프로필 조회 중 오류가 발생했습니다.' });
        }
    }
};

export default userService;