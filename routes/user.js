import express from 'express';
import userService from '../service/userService.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import tokenUtil from '../utils/tokenUtil.js';
import tokenBlacklistDao from '../dao/tokenBlacklistDao.js';
import logger from '../utils/logger.js';

const userRouter = express.Router();

// 로그인 라우트
userRouter.post('/login', userService.loginHandler.bind(userService));

// 비밀번호 변경 라우트
userRouter.put('/password', verifyToken, userService.changePasswordHandler.bind(userService));

// 회원정보 수정 라우트
userRouter.put('/info', verifyToken, userService.updateUserInfoHandler.bind(userService));

// 회원 탈퇴 라우트
userRouter.delete('/withdraw', verifyToken, userService.withdrawUserHandler.bind(userService));

// 토큰 갱신 라우트
userRouter.post('/refresh-token', async (req, res) => {
    try {
        const { token, userId } = req.body;

        if (!token || !userId) {
            return res.status(400).json({ success: false, message: '토큰과 사용자 ID는 필수 입력값입니다.' });
        }

        // 토큰 검증
        const decoded = await tokenUtil.verifyToken(token);
        if (decoded.userId !== userId) {
            return res.status(401).json({ success: false, message: '유효하지 않은 토큰입니다.' });
        }

        // 이전 토큰을 블랙리스트에 추가
        await tokenBlacklistDao.addToBlacklist(token, userId);

        // 새 토큰 발급
        const newToken = await tokenUtil.refreshToken(token);
        
        logger.info('(userRouter.refresh-token) 토큰 갱신 완료', {
            userId,
            timestamp: new Date().toISOString()
        });

        res.status(200).json({
            success: true,
            message: '토큰이 갱신되었습니다.',
            data: { token: newToken }
        });
    } catch (err) {
        logger.error('(userRouter.refresh-token) 토큰 갱신 실패', {
            error: err.toString(),
            userId: req.body.userId,
            timestamp: new Date().toISOString()
        });
        res.status(500).json({ success: false, message: '토큰 갱신 중 오류가 발생했습니다.' });
    }
});

// 로그아웃 라우트
userRouter.post('/logout', verifyToken, userService.logoutHandler.bind(userService));

// 프로필 조회 라우트
userRouter.get('/profile', verifyToken, userService.getUserProfile.bind(userService));

export default userRouter;
