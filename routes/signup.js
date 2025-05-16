import express from 'express';
import signupService from '../service/signupService.js';
import logger from '../utils/logger.js';

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
      if(!params.userId || !params.password || !params.username || !params.email || !params.phoneNumber || !params.birthDate || !params.gender) {
        const err = new Error(
            "사용자 아이디, 비밀번호, 이름, 이메일, 전화번호, 생년월일, 성별은 필수 입력값입니다."
          );
          logger.error(err.toString());
          return res.status(400).json({ err: err.toString() });
      }
    const user = await signupService.createUser(params);
    logger.info(`(signupRouter.createUser) response: ${JSON.stringify(user)}`);
    res.status(200).json(user);
  } catch (err) {
    logger.error(`(signupRouter.createUser) error: ${err.toString()}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default signupRouter;
