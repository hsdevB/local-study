import express from 'express';
import categoryRouter from './category.js';
import cityRouter from './city.js';
import districtRouter from './district.js';
import townRouter from './town.js';
import signupRouter from './signup.js';
import userRouter from './user.js';
import passwordResetRouter from './passwordReset.js';
import studyRouter from './study.js';

const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.use('/category', categoryRouter);
router.use('/city', cityRouter);
router.use('/district', districtRouter);
router.use('/town', townRouter);
router.use('/signup', signupRouter);
router.use('/user', userRouter);
router.use('/password-reset', passwordResetRouter);
router.use('/study', studyRouter);
export default router;
