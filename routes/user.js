import express from 'express';
import userService from '../service/userService.js';
import logger from '../utils/logger.js';
import { AppError } from '../utils/errorHandler.js';
import tokenUtil from '../utils/tokenUtil.js';

const userRouter = express.Router();

// 인증 미들웨어
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('인증 토큰이 필요합니다.', 401);
        }

        const token = authHeader.split(' ')[1];
        const decoded = await tokenUtil.verifyToken(token);
        req.user = decoded;
        next();
    } catch (err) {
        next(new AppError('유효하지 않은 토큰입니다.', 401));
    }
};

// 로그인 라우트
userRouter.post('/login', async (req, res) => {
    try {
        const { userId, password } = req.body;
        
        if (!userId || !password) {
            throw new AppError('사용자 ID와 비밀번호는 필수 입력값입니다.', 400);
        }

        // 클라이언트 IP와 User-Agent 정보 추가
        const loginParams = {
            userId,
            password,
            ip: req.ip,
            userAgent: req.get('user-agent')
        };

        const result = await userService.login(loginParams);
        
        res.status(200).json({
            success: true,
            message: '로그인 성공',
            data: result
        });
    } catch (err) {
        logger.error('(userRouter.login)', {
            error: err.toString(),
            body: req.body
        });

        if (err instanceof AppError) {
            res.status(err.statusCode).json({
                success: false,
                message: err.message
            });
        } else {
            res.status(500).json({
                success: false,
                message: '로그인 처리 중 오류가 발생했습니다.'
            });
        }
    }
});

// 비밀번호 변경 라우트
userRouter.put('/password', async (req, res) => {
    try {
        const { userId, currentPassword, newPassword } = req.body;

        if (!userId || !currentPassword || !newPassword) {
            throw new AppError('사용자 ID, 현재 비밀번호, 새 비밀번호는 필수 입력값입니다.', 400);
        }

        const result = await userService.changePassword(userId, currentPassword, newPassword);
        
        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (err) {
        logger.error('(userRouter.changePassword)', {
            error: err.toString(),
            body: req.body
        });

        if (err instanceof AppError) {
            res.status(err.statusCode).json({
                success: false,
                message: err.message
            });
        } else {
            res.status(500).json({
                success: false,
                message: '비밀번호 변경 중 오류가 발생했습니다.'
            });
        }
    }
});

// 회원정보 수정 라우트
userRouter.put('/info', async (req, res) => {
    try {
        const { userId } = req.body;
        const updateData = { ...req.body };
        delete updateData.userId; // userId는 where 조건으로만 사용

        if (!userId) {
            throw new AppError('사용자 ID는 필수 입력값입니다.', 400);
        }

        if (Object.keys(updateData).length === 0) {
            throw new AppError('수정할 정보가 없습니다.', 400);
        }

        const result = await userService.updateUserInfo(userId, updateData);
        
        res.status(200).json({
            success: true,
            message: result.message,
            data: result.data
        });
    } catch (err) {
        logger.error('(userRouter.updateUserInfo)', {
            error: err.toString(),
            body: req.body
        });

        if (err instanceof AppError) {
            res.status(err.statusCode).json({
                success: false,
                message: err.message
            });
        } else {
            res.status(500).json({
                success: false,
                message: '회원정보 수정 중 오류가 발생했습니다.'
            });
        }
    }
});

// 회원 탈퇴 라우트
userRouter.delete('/withdraw', async (req, res) => {
    try {
        const { userId, password } = req.body;

        if (!userId || !password) {
            throw new AppError('사용자 ID와 비밀번호는 필수 입력값입니다.', 400);
        }

        const result = await userService.withdrawUser(userId, password);
        
        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (err) {
        logger.error('(userRouter.withdrawUser)', {
            error: err.toString(),
            body: req.body
        });

        if (err instanceof AppError) {
            res.status(err.statusCode).json({
                success: false,
                message: err.message
            });
        } else {
            res.status(500).json({
                success: false,
                message: '회원 탈퇴 중 오류가 발생했습니다.'
            });
        }
    }
});

// 토큰 갱신 라우트
userRouter.post('/refresh-token', async (req, res) => {
    try {
        const { token, userId } = req.body;

        if (!token || !userId) {
            throw new AppError('토큰과 사용자 ID는 필수 입력값입니다.', 400);
        }

        // 토큰 검증
        const decoded = await tokenUtil.verifyToken(token);
        if (decoded.userId !== userId) {
            throw new AppError('유효하지 않은 토큰입니다.', 401);
        }

        const newToken = await tokenUtil.refreshToken(token);
        
        res.status(200).json({
            success: true,
            message: '토큰이 갱신되었습니다.',
            data: { token: newToken }
        });
    } catch (err) {
        logger.error('(userRouter.refreshToken)', {
            error: err.toString(),
            userId: req.body.userId
        });

        if (err instanceof AppError) {
            res.status(err.statusCode).json({
                success: false,
                message: err.message
            });
        } else {
            res.status(500).json({
                success: false,
                message: '토큰 갱신 중 오류가 발생했습니다.'
            });
        }
    }
});

// 로그아웃 라우트
userRouter.post('/logout', authenticateToken, async (req, res, next) => {
    try {
        const { userId } = req.user;
        const token = req.headers.authorization?.split(' ')[1];
        
        await userService.logout(userId, token);
        
        res.status(200).json({ 
            success: true,
            message: '로그아웃되었습니다.' 
        });
    } catch (err) {
        next(err);
    }
});

export default userRouter;
