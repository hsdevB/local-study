import jwt from "jsonwebtoken";
import { AppError } from './errorHandler.js';
import logger from './logger.js';

const secretKey = process.env.SECRET_KEY || "basesecretkey";

const options = {
  expiresIn: process.env.EXPIRESIN || "2h",
  issuer: 'localStudy',
  algorithm: 'HS256'
};

const tokenUtil = {
  makeToken: async (user) => {
    try {
      const payload = {
        id: user.id,
        userId: user.userId,
        username: user.username,
        email: user.email
      };

      const token = jwt.sign(payload, secretKey, options);
      
      logger.info('(tokenUtil.makeToken)', {
        userId: user.userId,
        timestamp: new Date().toISOString()
      });

      return token;
    } catch (err) {
      logger.error('(tokenUtil.makeToken)', {
        error: err.toString(),
        userId: user.userId
      });
      throw new AppError('토큰 생성 중 오류가 발생했습니다.', 500);
    }
  },

  verifyToken: async (token) => {
    try {
      const decoded = jwt.verify(token, secretKey);
      
      logger.info('(tokenUtil.verifyToken)', {
        userId: decoded.userId,
        timestamp: new Date().toISOString()
      });

      return decoded;
    } catch (err) {
      logger.error('(tokenUtil.verifyToken)', {
        error: err.toString()
      });

      if (err.name === 'TokenExpiredError') {
        throw new AppError('만료된 토큰입니다.', 401);
      } else if (err.name === 'JsonWebTokenError') {
        throw new AppError('유효하지 않은 토큰입니다.', 401);
      } else {
        throw new AppError('토큰 검증 중 오류가 발생했습니다.', 500);
      }
    }
  },

  refreshToken: async (token) => {
    try {
      const decoded = await tokenUtil.verifyToken(token);
      const newToken = await tokenUtil.makeToken(decoded);
      
      logger.info('(tokenUtil.refreshToken)', {
        userId: decoded.userId,
        timestamp: new Date().toISOString()
      });

      return newToken;
    } catch (err) {
      logger.error('(tokenUtil.refreshToken)', {
        error: err.toString()
      });
      throw err;
    }
  }
};

// 인증 미들웨어
export const authenticateToken = async (req, res, next) => {
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

export default tokenUtil;
