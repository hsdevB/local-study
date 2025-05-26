import express from 'express';
import { authenticateToken } from '../utils/tokenUtil.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import studyApplicationService from '../service/studyApplicationService.js';

const studyApplicationRouter = express.Router();

// 스터디 참가 신청
studyApplicationRouter.post('/:studyId', verifyToken, studyApplicationService.applyForStudyHandler.bind(studyApplicationService));

// 내가 신청한 스터디 목록 조회
studyApplicationRouter.get('/my', verifyToken, studyApplicationService.getMyApplicationsHandler.bind(studyApplicationService));

// 스터디의 참가 신청 목록 조회
studyApplicationRouter.get('/study/:studyId', verifyToken, studyApplicationService.getStudyApplicationsHandler.bind(studyApplicationService));

// 참가 신청 상태 업데이트 (수락/거절)
studyApplicationRouter.patch('/:applicationId/status', verifyToken, studyApplicationService.updateApplicationStatusHandler.bind(studyApplicationService));

// 참가 신청 취소
studyApplicationRouter.delete('/:applicationId', verifyToken, studyApplicationService.cancelApplicationHandler.bind(studyApplicationService));

// 내가 만든(운영하는) 스터디 목록 조회
studyApplicationRouter.get('/my-created', verifyToken, studyApplicationService.getMyCreatedStudiesHandler.bind(studyApplicationService));



export default studyApplicationRouter; 