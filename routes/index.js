import express from 'express';
import categoryRoutes from './category.js';
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.use('/categories', categoryRoutes);
export default router;
