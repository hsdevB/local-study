import express from 'express';
import studyService from '../service/studyService.js';
import { upload, handleUploadError } from '../middleware/uploadMiddleware.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const studyRouter = express.Router();

// 스터디 생성
studyRouter.post('/', verifyToken, upload.single('thumbnail'), handleUploadError, studyService.createStudy);

// 스터디 목록 조회
studyRouter.get('/', studyService.getStudies);

// 내가 만든 스터디 목록 조회
studyRouter.get('/my', verifyToken, studyService.getMyStudies);

// 스터디 상세 조회
studyRouter.get('/:id', studyService.getStudyById);

// 스터디 수정 (인증 필요)
studyRouter.put('/:id', verifyToken, upload.single('thumbnail'), handleUploadError, studyService.updateStudy);

// 스터디 삭제 (인증 필요)
studyRouter.delete('/:id', verifyToken, studyService.deleteStudy);

// 참여자 추방
studyRouter.delete('/:id/participant/:userId', verifyToken, studyService.kickParticipant);

export default studyRouter; 