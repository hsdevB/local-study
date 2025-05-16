import { AppError } from './errorHandler.js';

const validationUtil = {
    validatePassword: (password) => {
        // 최소 8자, 최대 20자
        if (password.length < 8 || password.length > 20) {
            throw new AppError('비밀번호는 8자 이상 20자 이하여야 합니다.', 400);
        }

        // 최소 하나의 대문자
        if (!/[A-Z]/.test(password)) {
            throw new AppError('비밀번호는 최소 하나의 대문자를 포함해야 합니다.', 400);
        }

        // 최소 하나의 소문자
        if (!/[a-z]/.test(password)) {
            throw new AppError('비밀번호는 최소 하나의 소문자를 포함해야 합니다.', 400);
        }

        // 최소 하나의 숫자
        if (!/[0-9]/.test(password)) {
            throw new AppError('비밀번호는 최소 하나의 숫자를 포함해야 합니다.', 400);
        }

        // 최소 하나의 특수문자
        if (!/[!@#$%^&*]/.test(password)) {
            throw new AppError('비밀번호는 최소 하나의 특수문자(!@#$%^&*)를 포함해야 합니다.', 400);
        }

        return true;
    },

    validateUserId: (userId) => {
        // 4-20자의 영문자, 숫자, 언더스코어만 허용
        if (!/^[a-zA-Z0-9_]{4,20}$/.test(userId)) {
            throw new AppError('사용자 ID는 4-20자의 영문자, 숫자, 언더스코어만 사용 가능합니다.', 400);
        }
        return true;
    },

    validateEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new AppError('유효한 이메일 주소를 입력해주세요.', 400);
        }
        return true;
    }
};

export default validationUtil; 