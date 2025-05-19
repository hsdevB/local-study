import express from 'express';
import categoryService from '../service/categoryService.js';

const categoryRouter = express.Router();

// GET /categories
categoryRouter.get('/', categoryService.getAllCategoriesHandler.bind(categoryService));

export default categoryRouter;