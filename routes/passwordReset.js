import express from 'express';
import passwordResetService from '../service/passwordResetService.js';
import { authenticateToken } from '../utils/tokenUtil.js';

const passwordResetRouter = express.Router();

passwordResetRouter.post('/request', authenticateToken, passwordResetService.requestPasswordResetHandler.bind(passwordResetService));

export default passwordResetRouter; 