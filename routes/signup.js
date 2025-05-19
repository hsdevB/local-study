import express from 'express';
import signupService from '../service/signupService.js';

const signupRouter = express.Router();

// POST /signup
signupRouter.post('/', signupService.createUserHandler.bind(signupService));

export default signupRouter;
