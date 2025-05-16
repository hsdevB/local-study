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

app.use('/', indexRouter);

// 데이터베이스 연결 및 테이블 생성 후 초기 데이터 삽입
models.sequelize
  .authenticate()
  .then(() => {
    logger.info("DB connection success");

    // sequelize sync (table 생성)
    models.sequelize
      .sync({ alter: true })
      .then(() => {
        logger.info("Sequelize sync success");
        // 테이블 생성 후 초기 데이터 삽입
        initializeAddressData();
        initializeCategory();
      })
      .catch((err) => {
        logger.error("Sequelize sync error", err);
      });
  })
  .catch((err) => {
    logger.error("DB Connection fail", err);
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
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    logger.error('(app) Unhandled Rejection:', err);
    process.exit(1);
});

export default app;
