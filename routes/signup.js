import express from 'express';
import signupService from '../service/signupService.js';

const signupRouter = express.Router();

// POST /signup
signupRouter.post('/', signupService.createUserHandler.bind(signupService));

signupRouter.get('/check-userid', signupService.checkUserId.bind(signupService));

signupRouter.get('/check-email', signupService.checkEmail.bind(signupService));
signupRouter.post('/send-email-code', signupService.sendEmailCode.bind(signupService));
signupRouter.post('/verify-email-code', signupService.verifyEmailCode.bind(signupService));

export default signupRouter;
