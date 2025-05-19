import logger from './logger.js';

export class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
    }
}

// 전역 에러 핸들러
export const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';

    logger.error('(errorHandler) 에러 발생', {
        error: err.toString(),
        errorMessage: err.message,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    res.status(statusCode).json({
        status,
        message: process.env.NODE_ENV === 'development' ? err.message : 
                err.isOperational ? err.message : '서버 내부 오류가 발생했습니다.'
    });
};

// 프로세스 에러 핸들러 설정
process.on('uncaughtException', (err) => {
    logger.error('(process) 처리되지 않은 예외 발생', {
        error: err.toString(),
        timestamp: new Date().toISOString()
    });
});

process.on('unhandledRejection', (reason) => {
    logger.error('(process) 처리되지 않은 Promise 거부', {
        reason: reason.toString(),
        timestamp: new Date().toISOString()
    });
});

process.on('SIGTERM', () => {
    logger.info('(process) SIGTERM 신호 수신. 정상 종료 시작');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('(process) SIGINT 신호 수신. 정상 종료 시작');
    process.exit(0); 
});