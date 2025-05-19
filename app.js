import createError from 'http-errors';
import express from 'express';
import path from 'path';
import logger from './utils/logger.js';
import {initializeAddressData} from './dao/initializeAddressData.js';
import {initializeCategory} from './dao/initializeCategory.js';
import models from './models/index.js';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './utils/errorHandler.js';

import indexRouter from './routes/index.js';

const app = express();
logger.info("Starting the application...");

// view engine setup
const __dirname = path.resolve();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// 보안 헤더 설정
app.use(helmet());

// CORS 설정
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting 설정
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15분
    max: 100, // IP당 최대 요청 수
    message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
});
app.use('/api/', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 로깅 미들웨어
app.use((req, res, next) => {
    logger.info('(app)', {
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
    next();
});

// 타임아웃 설정
app.use((req, res, next) => {
    // 요청 타임아웃 설정 (3초)
    req.setTimeout(3000, () => {
        logger.error('(app) 요청 타임아웃', {
            path: req.path,
            method: req.method,
            timestamp: new Date().toISOString()
        });
    });

    // 응답 타임아웃 설정 (3초)
    res.setTimeout(3000, () => {
        logger.error('(app) 응답 타임아웃', {
            path: req.path,
            method: req.method,
            timestamp: new Date().toISOString()
        });
    });

    next();
});

app.use('/', indexRouter);

// 데이터베이스 연결 및 마이그레이션 실행
models.sequelize.authenticate()
  .then(() => {
    logger.info("DB connection success");
    return models.sequelize.sync({ alter: true });
  })
  .then(() => {
    logger.info("Sequelize sync success");
    // 테이블 생성 후 초기 데이터 삽입
    initializeAddressData();
    initializeCategory();
    // 서버 시작
    app.listen(process.env.PORT || 3000, () => {
      logger.info(`서버가 ${process.env.PORT || 3000}번 포트에서 실행 중입니다.`);
    });
  })
  .catch((err) => {
    logger.error("Sequelize sync error", err);
  });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// 에러 핸들러
app.use(errorHandler);

// 서버 에러 처리
process.on('uncaughtException', (err) => {
    logger.error('(app) Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
    logger.error('(app) Unhandled Rejection:', err);
});

export default app;
