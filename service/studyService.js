import studyDao from '../dao/studyDao.js';
import logger from '../utils/logger.js';
import { AppError } from '../utils/errorHandler.js';
import { Op } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import studyApplicationDao from '../dao/studyApplicationDao.js';
import db from '../models/index.js';

const { StudyApplication, User } = db;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const studyService = {
    getStudies: async (req, res) => {
        try {
            const { category_id, city_id, search, status } = req.query || {};
            const where = {};
            
            if (category_id && category_id !== 'all') {
                where.category_id = Number(category_id);
            }
            if (city_id) where.city_id = Number(city_id);
            if (status) where.status = status;
            if (search) {
                where[Op.or] = [
                    { title: { [Op.like]: `%${search}%` } },
                    { description: { [Op.like]: `%${search}%` } }
                ];
            }

            const studies = await studyDao.findStudies(where);

            // 응답 데이터 가공
            const formattedStudies = studies.map(study => {
                const { category_id, city_id, ...rest } = study.toJSON();
                return {
                    ...rest,
                    Category: study.Category,
                    City: study.City,
                    District: study.District,
                    Town: study.Town,
                };
            });

            logger.info('(studyService.getStudies) 스터디 목록 조회 완료', {
                resultCount: studies.length,
                timestamp: new Date().toISOString()
            });

            res.status(200).json({
                success: true,
                message: studies.length === 0 ? '등록된 스터디가 없습니다.' : '스터디 목록 조회 성공',
                data: formattedStudies
            });
        } catch (err) {
            logger.error('(studyService.getStudies) 스터디 목록 조회 실패', {
                error: err.toString(),
                errorMessage: err.message,
                stack: err.stack,
                timestamp: new Date().toISOString()
            });
            res.status(500).json({ 
                success: false, 
                message: '스터디 목록 조회 중 오류가 발생했습니다.' 
            });
        }
    },

    getStudyById: async (req, res) => {
        try {
            const { id } = req.params;
            const study = await studyDao.findStudyById(id);

            if (!study) {
                logger.warn('(studyService.getStudyById) 존재하지 않는 스터디 조회 시도', {
                    studyId: id,
                    timestamp: new Date().toISOString()
                });
                return res.status(404).json({ 
                    success: false, 
                    message: '존재하지 않는 스터디입니다.' 
                });
            }

            // study 객체를 JSON으로 변환
            let studyObj = study.toJSON();

            // 불필요한 필드 제거
            delete studyObj.district_id;
            delete studyObj.town_id;
            delete studyObj.user_id;
            delete studyObj.category_id;
            delete studyObj.city_id;

            // current_participants 기본값 보정
            if (!studyObj.current_participants || studyObj.current_participants < 1) {
                studyObj.current_participants = 1;
            }

            // 모든 신청(approved, kicked 등) 조회
            const allApps = await StudyApplication.findAll({
                where: { study_id: studyObj.id },
                include: [{
                    model: User,
                    as: 'User',
                    attributes: ['id', 'userId', 'nickname']
                }]
            });
            let participants = allApps.map(app => ({
                id: app.User.id,
                userId: app.User.userId,
                nickname: app.User.nickname,
                status: app.status,
                isAuthor: false
            }));

            // 작성자 정보 추가 (중복 방지)
            if (!participants.some(p => p.id === studyObj.User.id)) {
                participants.unshift({
                    id: studyObj.User.id,
                    userId: studyObj.User.userId,
                    nickname: studyObj.User.nickname,
                    isAuthor: true
                });
            } else {
                participants = participants.map(p =>
                    p.id === studyObj.User.id ? { ...p, isAuthor: true } : p
                );
            }
            studyObj.participants = participants;
            let responseData = { study: studyObj };

            if (req.user) {
                const application = await studyDao.findStudyApplication(id, req.user.id);
                responseData.application = application;
                responseData.isAuthor = studyObj.User.id === req.user.id;
                responseData.isParticipant = participants.some(p => p.id === req.user.id);
            }

            logger.info('(studyService.getStudyById) 스터디 상세 조회 완료', {
                studyId: id,
                userId: req.user?.id,
                timestamp: new Date().toISOString()
            });

            res.status(200).json({
                success: true,
                data: responseData
            });
        } catch (err) {
            logger.error('(studyService.getStudyById) 스터디 상세 조회 실패', {
                error: err.toString(),
                studyId: req.params.id,
                timestamp: new Date().toISOString()
            });
            res.status(500).json({ 
                success: false, 
                message: '스터디 상세 조회 중 오류가 발생했습니다.' 
            });
        }
    },

    updateStudy: async (req, res) => {
        try {
            if (!req.user) {
                throw new AppError('로그인이 필요한 서비스입니다.', 401);
            }

            const { id } = req.params;
            const study = await studyDao.findStudyByIdAndUserId(id, req.user.id);

            if (!study) {
                logger.warn('(studyService.updateStudy) 존재하지 않는 스터디 수정 시도 또는 권한 없음', {
                    studyId: id,
                    userId: req.user.id,
                    timestamp: new Date().toISOString()
                });
                throw new AppError('존재하지 않는 스터디이거나 수정 권한이 없습니다.', 404);
            }

            // 기본 스터디 정보 업데이트
            const updatedStudy = await studyDao.updateStudy(study, req.body);

            // 썸네일 처리
            if (req.file) {
                // 새로운 썸네일이 업로드된 경우
                const thumbnailData = {
                    path: req.file.path,
                    filename: req.file.filename,
                    size: req.file.size,
                    mimetype: req.file.mimetype
                };
                await studyDao.updateStudyThumbnail(id, thumbnailData);
            } else if (req.body.delete_thumbnail === 'true') {
                // 썸네일 삭제 요청이 있는 경우
                const defaultThumbnail = {
                    path: '/images/logo.png',
                    filename: 'logo.png',
                    size: 0,
                    mimetype: 'image/png'
                };
                await studyDao.updateStudyThumbnail(id, defaultThumbnail);
            } else if (req.body.keep_thumbnail === 'true') {
                // 기존 썸네일 유지
                logger.info('(studyService.updateStudy) 기존 썸네일 유지', {
                    studyId: id,
                    timestamp: new Date().toISOString()
                });
            }
            // 썸네일 관련 요청이 없는 경우 기존 썸네일 유지

            logger.info('(studyService.updateStudy) 스터디 수정 완료', {
                studyId: id,
                userId: req.user.id,
                hasNewThumbnail: !!req.file,
                deleteThumbnail: req.body.delete_thumbnail === 'true',
                keepThumbnail: req.body.keep_thumbnail === 'true',
                timestamp: new Date().toISOString()
            });

            res.status(200).json({
                success: true,
                message: '스터디가 수정되었습니다.',
                data: updatedStudy
            });
        } catch (err) {
            logger.error('(studyService.updateStudy) 스터디 수정 실패', {
                error: err.toString(),
                studyId: req.params.id,
                timestamp: new Date().toISOString()
            });
            return res.status(500).json({
                success: false,
                message: '스터디 수정 중 오류가 발생했습니다.'
            });
        }
    },

    deleteStudy: async (req, res) => {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, message: '로그인이 필요한 서비스입니다.' });
            }
            const { id } = req.params;
            const study = await studyDao.findStudyByIdAndUserId(id, req.user.id);
            
            if (!study) {
                logger.warn('(studyService.deleteStudy) 존재하지 않는 스터디 삭제 시도 또는 권한 없음', {
                    studyId: id,
                    userId: req.user.id,
                    timestamp: new Date().toISOString()
                });
                return res.status(404).json({ success: false, message: '존재하지 않는 스터디이거나 삭제 권한이 없습니다.' });
            }

            await studyDao.deleteStudy(study);

            logger.info('(studyService.deleteStudy) 스터디 삭제 완료', {
                studyId: id,
                userId: req.user.id,
                timestamp: new Date().toISOString()
            });

            res.status(200).json({
                success: true,
                message: '스터디가 삭제되었습니다.'
            });
        } catch (err) {
            logger.error('(studyService.deleteStudy) 스터디 삭제 실패', {
                error: err.toString(),
                studyId: req.params.id,
                userId: req.user?.id,
                timestamp: new Date().toISOString()
            });
            res.status(500).json({ success: false, message: '스터디 삭제 중 오류가 발생했습니다.' });
        }
    },

    createStudy: async (req, res) => {
        try {
            if (!req.user) {
                throw new AppError('로그인이 필요한 서비스입니다.', 401);
            }

            // 필수 지역 정보 검증
            if (!req.body.city_id) {
                throw new AppError('시/도 정보는 필수입니다.', 400);
            }

            const studyData = {
                ...req.body,
                user_id: req.user.id,
                city_id: req.body.city_id,
                district_id: req.body.district_id || null,
                town_id: req.body.town_id || null
            };

            let thumbnailFile = req.file;
            if (!thumbnailFile) {
                thumbnailFile = {
                    filename: 'logo.png',
                    path: '/images/logo.png',
                    mimetype: 'image/png',
                    size: 0
                };
            }

            const study = await studyDao.createStudy(studyData, thumbnailFile);

            logger.info('(studyService.createStudy) 스터디 생성 완료', {
                studyId: study.id,
                userId: req.user.id,
                cityId: studyData.city_id,
                districtId: studyData.district_id,
                townId: studyData.town_id,
                hasThumbnail: !!req.file,
                isDefaultImage: !req.file,
                timestamp: new Date().toISOString()
            });

            res.status(201).json({
                success: true,
                message: '스터디가 생성되었습니다.',
                data: study
            });
        } catch (err) {
            logger.error('(studyService.createStudy) 스터디 생성 실패', {
                error: err.toString(),
                userId: req.user?.id,
                timestamp: new Date().toISOString()
            });
            res.status(500).json({ success: false, message: '스터디 생성 중 오류가 발생했습니다.' });
        }
    },

    kickParticipant: async (req, res) => {
        try {
            const { id, userId } = req.params;
            const requesterId = req.user.id;

            // 1. 스터디 존재 및 권한 확인
            const study = await studyDao.findStudyById(id);
            if (!study) {
                return res.status(404).json({ success: false, message: '존재하지 않는 스터디입니다.' });
            }
            if (study.user_id !== requesterId) {
                return res.status(403).json({ success: false, message: '스터디 생성자만 추방할 수 있습니다.' });
            }
            if (study.user_id == userId) {
                return res.status(400).json({ success: false, message: '작성자는 추방할 수 없습니다.' });
            }

            // 2. 해당 유저의 참가 신청 상태를 'kicked'로 변경
            const application = await studyApplicationDao.findApplicationByStudyAndUser(id, userId);
            if (!application || application.status !== 'approved') {
                return res.status(404).json({ success: false, message: '해당 유저는 승인된 참여자가 아닙니다.' });
            }
            await studyApplicationDao.kickApplication(application.id);

            // 3. 현재 참가자 수 감소
            if (study.current_participants > 0) {
                await studyDao.updateStudy(study, {
                    current_participants: study.current_participants - 1
                });
            }

            res.status(200).json({ success: true, message: '참여자가 추방되었습니다.' });
        } catch (err) {
            res.status(500).json({ success: false, message: '참여자 추방 중 오류가 발생했습니다.' });
        }
    },

    // 내가 만든 스터디 목록 조회
    getMyStudies: async (req, res) => {
        try {
            const userId = req.user.id;
            if (!userId) {
                logger.warn('(studyService.getMyStudies) 로그인하지 않은 사용자의 요청', {
                    timestamp: new Date().toISOString()
                });
                return res.status(401).json({ 
                    success: false,
                    message: '로그인이 필요합니다.' 
                });
            }

            logger.info('(studyService.getMyStudies) 내가 만든 스터디 조회 시작', {
                userId,
                timestamp: new Date().toISOString()
            });

            const studies = await studyDao.findStudiesByUserId(userId);
            
            logger.info('(studyService.getMyStudies) 내가 만든 스터디 조회 완료', {
                userId,
                studyCount: studies.length,
                timestamp: new Date().toISOString()
            });

            res.status(200).json({
                success: true,
                message: studies.length === 0 ? '생성한 스터디가 없습니다.' : '내가 만든 스터디 목록 조회 성공',
                data: studies
            });
        } catch (error) {
            logger.error('(studyService.getMyStudies) 내가 만든 스터디 목록 조회 실패', {
                error: error.toString(),
                errorMessage: error.message,
                errorStack: error.stack,
                userId: req.user?.id,
                timestamp: new Date().toISOString()
            });
            res.status(500).json({ 
                success: false,
                message: '내가 만든 스터디 목록 조회 중 오류가 발생했습니다.' 
            });
        }
    }
};

export default studyService; 