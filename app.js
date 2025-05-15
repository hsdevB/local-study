import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from './utils/logger.js';
import initializeDatabase from './dao/initialize.js';
import models from './models/index.js';
import cors from 'cors';
import corsConfig from './config/corsConfig.json' with { type: 'json' };

import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';

const app = express();
logger.info("Starting the application...");
// 초기 데이터 삽입
initializeDatabase().then(() => {
  console.log("Initial data inserted successfully.");
}).catch(err => {
  console.error("Error during initialization:", err);
});

// view engine setup
const __dirname = path.resolve();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// app.use(logger('dev'));
app.use(cors(corsConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

models.sequelize
  .authenticate()
  .then(() => {
    logger.info("DB connection success");

    // sequelize sync (table 생성)
    models.sequelize
      .sync({ alter: true })
      .then(() => {
        logger.info("Sequelize sync success");
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

export default app;
