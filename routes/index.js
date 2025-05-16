import express from 'express';
import categoryRouter from './category.js';
import cityRouter from './city.js';
import districtRouter from './district.js';
import townRouter from './town.js';
import signupRouter from './signup.js';
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
export default router;
