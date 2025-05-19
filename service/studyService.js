import studyDao from '../dao/studyDao.js';
import logger from '../utils/logger.js';
import { AppError } from '../utils/errorHandler.js';
import { Op } from 'sequelize';

const studyService = {
    createStudy: async (req, res) => {
        try {
            if (!req.user) {
                throw new AppError('로그인이 필요한 서비스입니다.', 401);
            }

            const studyData = {
                ...req.body,
                user_id: req.user.id
            };

            const study = await studyDao.createStudy(studyData);

            logger.info('(studyService.createStudy) 스터디 생성 완료', {
                studyId: study.id,
                userId: req.user.id,
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
            const { category_id, city_id, search } = req.query;
            const where = {};

            if (category_id) where.category_id = category_id;
            if (city_id) where.city_id = city_id;
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
            const studies = await studyDao.findEndedStudies();

            logger.info('(studyService.getEndedStudies) 종료된 스터디 목록 조회 완료', {
                resultCount: studies.length,
                timestamp: new Date().toISOString()
            });

            res.status(200).json({
                success: true,
                data: studies
            });
        } catch (err) {
            logger.error('(studyService.getEndedStudies) 종료된 스터디 목록 조회 실패', {
                error: err.toString(),
                timestamp: new Date().toISOString()
            });
            throw err;
        }
    }
};

export default studyService; 