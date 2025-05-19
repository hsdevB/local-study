import express from 'express';
import cityService from '../service/cityService.js';

const cityRouter = express.Router();

// GET /cities
cityRouter.get('/', cityService.fetchAllCitiesHandler.bind(cityService));

export default cityRouter;
