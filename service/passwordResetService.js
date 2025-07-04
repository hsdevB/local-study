import userDao from '../dao/userDao.js';
import hashUtil from '../utils/hashUtil.js';
import emailUtil from '../utils/emailUtil.js';
import logger from '../utils/logger.js';
import { AppError } from '../utils/errorHandler.js';
import crypto from 'crypto';

const passwordResetService = {
  requestPasswordReset: async (userId, email) => {
    try {
      // 1. 사용자 정보 확인
      const user = await userDao.findByUserId(userId);
      if (!user) {
        throw new AppError('존재하지 않는 사용자입니다.', 404);
      }

      // 2. 이메일 일치 여부 확인
      if (user.email !== email) {
        throw new AppError('입력하신 이메일이 등록된 이메일과 일치하지 않습니다.', 400);
      }

      // 3. 임시 비밀번호 생성 (8자리: 영문 대소문자 + 숫자)
      const tempPassword = crypto.randomBytes(4).toString('hex').toUpperCase();

      // 4. 비밀번호 업데이트와 이메일 발송을 병렬로 처리
      const [hashedTempPassword] = await Promise.all([
        hashUtil.makePasswordHash(tempPassword),
        emailUtil.sendPasswordResetEmail(email, tempPassword)
      ]);

      // 5. 비밀번호 업데이트
      await userDao.updatePassword(userId, hashedTempPassword);

      logger.info('(passwordResetService.requestPasswordReset) 비밀번호 재설정 완료', {
        userId,
        email,
        status: 'success',
        timestamp: new Date().toISOString()
      });

      return {
        message: '임시 비밀번호가 이메일로 발송되었습니다.'
      };
    } catch (err) {
      logger.error('(passwordResetService.requestPasswordReset) 비밀번호 재설정 실패', {
        error: err.toString(),
        userId,
        email,
        timestamp: new Date().toISOString()
      });
      throw err;
    }
  },
  async requestPasswordResetHandler(req, res, next) {
    try {
      const { userId, email } = req.body;
      if (!userId || !email) {
        return res.status(400).json({ success: false, message: '아이디와 이메일을 모두 입력해주세요.' });
      }
      const result = await this.requestPasswordReset(userId, email);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      res.status(500).json({ success: false, message: '아이디와 이메일을 다시 확인해주세요.' });
    }
  }
};

export default passwordResetService; 