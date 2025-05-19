import signupDao from '../dao/signupDao.js';
import hashUtil from '../utils/hashUtil.js';
import logger from '../utils/logger.js';
import { AppError } from '../utils/errorHandler.js';

const signupService = {
    async createUser(params) {
        try {
            // 1. 기본 유효성 검사
            if (params.userId.length < 3) {
                throw new Error('아이디는 3자 이상이어야 합니다.');
            }

            // 1-1. 영어와 숫자만 허용 (정규식 사용)
            if (!/^[a-zA-Z0-9]+$/.test(params.userId)) {
              throw new Error('아이디는 영어와 숫자만 사용할 수 있습니다.');
            }
            
            // 2. 이메일 형식 검사
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(params.email)) {
                throw new Error('올바른 이메일 형식이 아닙니다.');
            }

            // 3. 전화번호 형식 검사 (예: 010-1234-5678)
            const phoneRegex = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/;
            if (!phoneRegex.test(params.phoneNumber)) {
                throw new AppError('올바른 전화번호 형식이 아닙니다.', 400);
            }

            // 4. 비밀번호 복잡도 검사 (예: 8자 이상, 영문/숫자/특수문자 포함)
            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
            if (!passwordRegex.test(params.password)) {
                throw new Error('비밀번호는 8자 이상이며, 영문/숫자/특수문자를 포함해야 합니다.');
            }

            // 5. 중복 ID 검사
            const existingUser = await signupDao.findByUserId(params.userId);
            if (existingUser) {
                throw new AppError('이미 존재하는 아이디입니다.', 400);
            }

            // 6. 중복 이메일 검사
            const existingEmail = await signupDao.findByEmail(params.email);
            if (existingEmail) {
                throw new AppError('이미 존재하는 이메일입니다.', 400);
            }

            // 7. 비밀번호 해싱
            const hashedPassword = await hashUtil.makePasswordHash(params.password);
            params.password = hashedPassword;

            // 8. 사용자 생성
            const user = await signupDao.createUser(params);
            
            logger.info('(signupService.createUser) 회원가입 완료', {
                userId: params.userId,
                email: params.email,
                timestamp: new Date().toISOString()
            });

            return user;
        } catch (err) {
            logger.error('(signupService.createUser) 회원가입 실패', {
                error: err.toString(),
                params: {
                    userId: params.userId,
                    email: params.email
                },
                timestamp: new Date().toISOString()
            });
            throw err;
        }
    },
};

export default signupService;