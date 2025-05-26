import express from 'express';
import passwordResetService from '../service/passwordResetService.js';

const passwordResetRouter = express.Router();

passwordResetRouter.post('/request', passwordResetService.requestPasswordResetHandler.bind(passwordResetService));

export default passwordResetRouter; 