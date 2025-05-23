import studyDao from '../dao/studyDao.js';
import logger from '../utils/logger.js';
import { AppError } from '../utils/errorHandler.js';
import { Op } from 'sequelize';
import fs from 'fs';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const studyService = {
    createStudy: async (req, res) => {
        try {
            if (!req.user) {
                throw new AppError('로그인이 필요한 서비스입니다.', 401);
            }

            const studyData = {
                ...req.body,
                user_id: req.user.id,
                city_id: req.body.city_id,
                district_id: req.body.district_id,
                town_id: req.body.town_id
            };

            // 썸네일이 없을 경우 기본 이미지 사용
            // const thumbnailFile = req.file || {
            //     filename: 'basicImage.jpg',
            //     path: 'public/images/basicImage.jpg',
            //     mimetype: 'image/jpeg',
            //     size: 0
            // };

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
            throw err;
        }
    },

    getStudies: async (req, res) => {
        try {
            const { category_id, city_id, search, status } = req.query || {};
            const where = {};

            if (category_id) where.category_id = category_id;
            if (city_id) where.city_id = city_id;
            if (status) where.status = status;
            if (search) {
                where[Op.or] = [
                    { title: { [Op.like]: `%${search}%` } },
                    { description: { [Op.like]: `%${search}%` } }
                ];
            }

            const studies = await studyDao.findStudies(where);

            logger.info('(studyService.getStudies) 스터디 목록 조회 완료', {
                resultCount: studies.length,
                timestamp: new Date().toISOString()
            });

            res.status(200).json({
                success: true,
                message: studies.length === 0 ? '등록된 스터디가 없습니다.' : '스터디 목록 조회 성공',
                data: studies || []
            });
        } catch (err) {
            logger.error('(studyService.getStudies) 스터디 목록 조회 실패', {
                error: err.toString(),
                errorMessage: err.message,
                timestamp: new Date().toISOString()
            });
            throw err;
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
                throw new AppError('존재하지 않는 스터디입니다.', 404);
            }

            let responseData = { study };

            if (req.user) {
                const application = await studyDao.findStudyApplication(id, req.user.id);
                responseData.application = application;
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
            throw err;
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

            const updatedStudy = await studyDao.updateStudy(study, req.body);

            logger.info('(studyService.updateStudy) 스터디 수정 완료', {
                studyId: id,
                userId: req.user.id,
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
                userId: req.user?.id,
                timestamp: new Date().toISOString()
            });
            throw err;
        }
    },

    deleteStudy: async (req, res) => {
        try {
            if (!req.user) {
                throw new AppError('로그인이 필요한 서비스입니다.', 401);
            }

            const { id } = req.params;
            const study = await studyDao.findStudyByIdAndUserId(id, req.user.id);

            if (!study) {
                logger.warn('(studyService.deleteStudy) 존재하지 않는 스터디 삭제 시도 또는 권한 없음', {
                    studyId: id,
                    userId: req.user.id,
                    timestamp: new Date().toISOString()
                });
                throw new AppError('존재하지 않는 스터디이거나 삭제 권한이 없습니다.', 404);
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
            throw err;
        }
    },

    getEndedStudies: async (req, res) => {
        try {
            const userId = req.user.userId;
            const studies = await studyDao.getEndedStudies(userId);
            
            logger.info('(studyService.getEndedStudies)', {
                userId,
                count: studies.length
            });

            res.status(200).json({
                success: true,
                message: '종료된 스터디 조회 성공',
                data: studies
            });
        } catch (err) {
            logger.error('(studyService.getEndedStudies)', {
                error: err.toString(),
                userId: req.user?.userId
            });
            throw new AppError('종료된 스터디 조회 중 오류가 발생했습니다.', 500);
        }
    },

    async getStudiesHandler(req, res) {
        try {
            const { category_id, city_id, search, status } = req.query || {};
            const where = {};
            
            if (category_id) where.category_id = category_id;
            if (city_id) where.city_id = city_id;
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

            logger.info('(studyService.getStudiesHandler) 스터디 목록 조회 완료', {
                resultCount: studies.length,
                timestamp: new Date().toISOString()
            });

            res.status(200).json({
                success: true,
                message: studies.length === 0 ? '등록된 스터디가 없습니다.' : '스터디 목록 조회 성공',
                data: formattedStudies
            });
        } catch (err) {
            logger.error('(studyService.getStudiesHandler) 스터디 목록 조회 실패', {
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

    async getStudyByIdHandler(req, res) {
        try {
            const { id } = req.params;
            const study = await studyDao.findStudyById(id);

            if (!study) {
                logger.warn('(studyService.getStudyByIdHandler) 존재하지 않는 스터디 조회 시도', {
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

            // _id 필드 제거
            delete studyObj.district_id;
            delete studyObj.town_id;
            delete studyObj.user_id;
            delete studyObj.category_id;
            delete studyObj.city_id;

            // current_participants 기본값 보정
            if (!studyObj.current_participants || studyObj.current_participants < 1) {
                studyObj.current_participants = 1;
            }

            // 승인된 참여자 조회
            const approvedApps = await studyDao.findApprovedParticipants(studyObj.id);
            let participants = approvedApps.map(app => ({
                id: app.User.id,
                userId: app.User.userId,
                nickname: app.User.nickname,
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
            }

            logger.info('(studyService.getStudyByIdHandler) 스터디 상세 조회 완료', {
                studyId: id,
                userId: req.user?.id,
                timestamp: new Date().toISOString()
            });

            res.status(200).json({
                success: true,
                data: responseData
            });
        } catch (err) {
            logger.error('(studyService.getStudyByIdHandler) 스터디 상세 조회 실패', {
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

    async updateStudyHandler(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, message: '로그인이 필요한 서비스입니다.' });
            }
            const { id } = req.params;
            const study = await studyDao.findStudyByIdAndUserId(id, req.user.id);
            
            if (!study) {
                logger.warn('(studyService.updateStudyHandler) 존재하지 않는 스터디 수정 시도 또는 권한 없음', {
                    studyId: id,
                    userId: req.user.id,
                    timestamp: new Date().toISOString()
                });
                return res.status(404).json({ success: false, message: '존재하지 않는 스터디이거나 수정 권한이 없습니다.' });
            }

            const updatedStudy = await studyDao.updateStudy(study, req.body);

            logger.info('(studyService.updateStudyHandler) 스터디 수정 완료', {
                studyId: id,
                userId: req.user.id,
                timestamp: new Date().toISOString()
            });

            res.status(200).json({
                success: true,
                message: '스터디가 수정되었습니다.',
                data: updatedStudy
            });
        } catch (err) {
            logger.error('(studyService.updateStudyHandler) 스터디 수정 실패', {
                error: err.toString(),
                studyId: req.params.id,
                userId: req.user?.id,
                timestamp: new Date().toISOString()
            });
            res.status(500).json({ success: false, message: '스터디 수정 중 오류가 발생했습니다.' });
        }
    },

    async deleteStudyHandler(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, message: '로그인이 필요한 서비스입니다.' });
            }
            const { id } = req.params;
            const study = await studyDao.findStudyByIdAndUserId(id, req.user.id);
            
            if (!study) {
                logger.warn('(studyService.deleteStudyHandler) 존재하지 않는 스터디 삭제 시도 또는 권한 없음', {
                    studyId: id,
                    userId: req.user.id,
                    timestamp: new Date().toISOString()
                });
                return res.status(404).json({ success: false, message: '존재하지 않는 스터디이거나 삭제 권한이 없습니다.' });
            }

            await studyDao.deleteStudy(study);

            logger.info('(studyService.deleteStudyHandler) 스터디 삭제 완료', {
                studyId: id,
                userId: req.user.id,
                timestamp: new Date().toISOString()
            });

            res.status(200).json({
                success: true,
                message: '스터디가 삭제되었습니다.'
            });
        } catch (err) {
            logger.error('(studyService.deleteStudyHandler) 스터디 삭제 실패', {
                error: err.toString(),
                studyId: req.params.id,
                userId: req.user?.id,
                timestamp: new Date().toISOString()
            });
            res.status(500).json({ success: false, message: '스터디 삭제 중 오류가 발생했습니다.' });
        }
    },

    async getEndedStudiesHandler(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, message: '로그인이 필요한 서비스입니다.' });
            }
            const userId = req.user.id;
            const studies = await studyDao.getEndedStudies(userId);
            
            logger.info('(studyService.getEndedStudiesHandler) 종료된 스터디 조회 완료', {
                userId,
                count: studies.length,
                timestamp: new Date().toISOString()
            });

            res.status(200).json({
                success: true,
                message: '종료된 스터디 조회 성공',
                data: studies
            });
        } catch (err) {
            logger.error('(studyService.getEndedStudiesHandler) 종료된 스터디 조회 실패', {
                error: err.toString(),
                userId: req.user?.id,
                timestamp: new Date().toISOString()
            });
            res.status(500).json({ success: false, message: '종료된 스터디 조회 중 오류가 발생했습니다.' });
        }
    }
};

export async function createStudyHandler(req, res) {
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

        logger.info('(studyService.createStudyHandler) 스터디 생성 완료', {
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
        logger.error('(studyService.createStudyHandler) 스터디 생성 실패', {
            error: err.toString(),
            userId: req.user?.id,
            timestamp: new Date().toISOString()
        });
        res.status(500).json({ success: false, message: '스터디 생성 중 오류가 발생했습니다.' });
    }
}

export default studyService; 