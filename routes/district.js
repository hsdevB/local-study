import express from 'express';
import districtService from '../service/districtService.js';
import logger from '../utils/logger.js';
import { AppError } from '../utils/errorHandler.js';

const districtRouter = express.Router();

// GET /districts/:cityId
districtRouter.get('/:cityId', districtService.fetchDistrictsByCityIdHandler.bind(districtService));

export default districtRouter;
