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
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from './config/swagger.js';

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
    origin: 'http://localhost:5173', // 프론트엔드 주소
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Set-Cookie', 'Content-Type', 'Content-Length'],
    credentials: true, // 쿠키 전송을 위해 필요
    maxAge: 86400 // 24시간
}));

// 쿠키 파서 미들웨어 추가
app.use(cookieParser());

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

// 정적 파일 서빙: public/images
app.use('/images', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    next();
}, express.static(path.join(__dirname, 'public/images'), {
    setHeaders: (res, path) => {
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    }
}));

// 라우터 설정
app.use('/', indexRouter);

// Swagger UI 설정
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

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
  console.error(err.stack);
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
