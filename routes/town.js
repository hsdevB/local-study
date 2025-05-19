import express from 'express';
import townService from '../service/townService.js';

const townRouter = express.Router();

// GET /towns/:districtId
townRouter.get('/:districtId', townService.fetchTownsByDistrictIdHandler.bind(townService));

export default townRouter;
