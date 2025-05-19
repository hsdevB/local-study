import express from 'express';
import studyService from '../service/studyService.js';
import authMiddleware from '../middleware/authMiddleware.js';

const studyRouter = express.Router();

// 스터디 생성 (인증 필요)
studyRouter.post('/', authMiddleware.verifyToken, studyService.createStudyHandler.bind(studyService));

// 스터디 목록 조회
studyRouter.get('/', studyService.getStudiesHandler.bind(studyService));

// 스터디 상세 조회
studyRouter.get('/:id', studyService.getStudyByIdHandler.bind(studyService));

// 스터디 수정 (인증 필요)
studyRouter.put('/:id', authMiddleware.verifyToken, studyService.updateStudyHandler.bind(studyService));

// 스터디 삭제 (인증 필요)
studyRouter.delete('/:id', authMiddleware.verifyToken, studyService.deleteStudyHandler.bind(studyService));

// 종료된 스터디 조회 (인증 필요)
studyRouter.get('/ended/list', authMiddleware.verifyToken, studyService.getEndedStudiesHandler.bind(studyService));

export default studyRouter; 