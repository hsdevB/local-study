import express from 'express';
import studyService from '../service/studyService.js';
import authMiddleware from '../middleware/authMiddleware.js';
import asyncHandler from '../utils/asyncHandler.js';

const studyRouter = express.Router();

// 스터디 생성 (인증 필요)
studyRouter.post('/', authMiddleware.verifyToken, asyncHandler(studyService.createStudy));

// 스터디 목록 조회
studyRouter.get('/', asyncHandler(studyService.getStudies));

// 스터디 상세 조회
studyRouter.get('/:id', asyncHandler(studyService.getStudyById));

// 스터디 수정 (인증 필요)
studyRouter.put('/:id', authMiddleware.verifyToken, asyncHandler(studyService.updateStudy));

// 스터디 삭제 (인증 필요)
studyRouter.delete('/:id', authMiddleware.verifyToken, asyncHandler(studyService.deleteStudy));

// 종료된 스터디 조회
studyRouter.get('/ended/list', asyncHandler(studyService.getEndedStudies));

export default studyRouter; 