import express from 'express';
import studyService, { createStudyHandler } from '../service/studyService.js';
import { upload, handleUploadError } from '../middleware/uploadMiddleware.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const studyRouter = express.Router();

// 스터디 생성
studyRouter.post('/', verifyToken, upload.single('thumbnail'), handleUploadError, createStudyHandler);

// 스터디 목록 조회
studyRouter.get('/', studyService.getStudiesHandler.bind(studyService));

// 내가 만든 스터디 조회
studyRouter.get('/my', verifyToken, studyService.getMyStudiesHandler.bind(studyService));

// 스터디 상세 조회
studyRouter.get('/:id', studyService.getStudyByIdHandler.bind(studyService));

// 스터디 수정 (인증 필요)
studyRouter.put('/:id', verifyToken, upload.single('thumbnail'), handleUploadError, studyService.updateStudyHandler.bind(studyService));

// 스터디 삭제 (인증 필요)
studyRouter.delete('/:id', verifyToken, studyService.deleteStudyHandler.bind(studyService));

// 종료된 스터디 조회 (인증 필요)
studyRouter.get('/ended/list', verifyToken, studyService.getEndedStudiesHandler.bind(studyService));

// 참여자 추방
studyRouter.delete('/:id/participant/:userId', verifyToken, studyService.kickParticipantHandler.bind(studyService));

export default studyRouter; 