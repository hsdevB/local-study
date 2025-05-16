import express from 'express';
import passwordResetService from '../service/passwordResetService.js';
import logger from '../utils/logger.js';

const passwordResetRouter = express.Router();

passwordResetRouter.post('/request', async (req, res, next) => {
  try {
    const { userId, email } = req.body;

    // 입력값 검증
    if (!userId || !email) {
      return res.status(400).json({
        error: {
          message: '아이디와 이메일을 모두 입력해주세요.',
          status: 400
        }
      });
    }

    const result = await passwordResetService.requestPasswordReset(userId, email);
    res.json(result);
  } catch (err) {
    logger.error('(passwordReset.request)', {
      error: err.toString(),
      body: req.body
    });
    next(err);
  }
});

export default passwordResetRouter; 