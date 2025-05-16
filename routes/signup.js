import express from 'express';
import signupService from '../service/signupService.js';
import logger from '../utils/logger.js';
import validationUtil from '../utils/validationUtil.js';
import { AppError } from '../utils/errorHandler.js';

const signupRouter = express.Router();

// POST /signup
signupRouter.post('/', async (req, res) => {
    try {
        const params = {
            userId: req.body.userId,
            password: req.body.password,
            username: req.body.username,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            birthDate: req.body.birthDate,
            gender: req.body.gender,
        };

        // 필수 입력값 검증
        if (!params.userId || !params.password || !params.username || 
            !params.email || !params.phoneNumber || !params.birthDate || !params.gender) {
            throw new AppError('사용자 아이디, 비밀번호, 이름, 이메일, 전화번호, 생년월일, 성별은 필수 입력값입니다.', 400);
        }

        // 입력값 형식 검증
        validationUtil.validateUserId(params.userId);
        validationUtil.validatePassword(params.password);
        validationUtil.validateEmail(params.email);
        validationUtil.validatePhoneNumber(params.phoneNumber);
        validationUtil.validateBirthDate(params.birthDate);

        // 사용자 생성
        const user = await signupService.createUser(params);
        
        logger.info('(signupRouter.createUser)', {
            userId: params.userId,
            email: params.email,
            timestamp: new Date().toISOString()
        });

        res.status(201).json({
            success: true,
            message: '회원가입이 완료되었습니다.',
            data: {
                userId: user.userId,
                email: user.email,
                username: user.username
            }
        });
    } catch (err) {
        logger.error('(signupRouter.createUser)', {
            error: err.toString(),
            params: req.body
        });

        if (err instanceof AppError) {
            res.status(err.statusCode).json({
                success: false,
                message: err.message
            });
        } else {
            res.status(500).json({
                success: false,
                message: '회원가입 처리 중 오류가 발생했습니다.'
            });
        }
    }
});

export default signupRouter;
