import logger from './logger.js';

class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        logger.error('(errorHandler)', {
            error: err,
            stack: err.stack,
            path: req.path,
            method: req.method
        });

        res.status(err.statusCode).json({
            success: false,
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    } else {
        // Production mode
        if (err.isOperational) {
            res.status(err.statusCode).json({
                success: false,
                status: err.status,
                message: err.message
            });
        } else {
            // Programming or unknown errors
            logger.error('(errorHandler)', {
                error: err,
                path: req.path,
                method: req.method
            });

            res.status(500).json({
                success: false,
                status: 'error',
                message: 'Something went wrong'
            });
        }
    }
};

export { AppError, errorHandler }; 