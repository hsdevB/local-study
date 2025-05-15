const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('./utils/logger');
const { initializeDatabase } = require('./dao/initialize');
const models = require('./models');
const cors = require('cors');
const corsConfig = require('./config/corsConfig');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();
logger.info("Starting the application...");
// 초기 데이터 삽입
initializeDatabase().then(() => {
  console.log("Initial data inserted successfully.");
}).catch(err => {
  console.error("Error during initialization:", err);
});

// view engine setup
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

module.exports = app;
