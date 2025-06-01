import Study from '../models/study.js';
import Category from '../models/category.js';
import City from '../models/city.js';
import User from '../models/user.js';
import StudyApplication from '../models/studyApplication.js';
import StudyThumbnail from '../models/studyThumbnail.js';
import District from '../models/district.js';
import Town from '../models/town.js';
import { Op } from 'sequelize';
import logger from '../utils/logger.js';
import { AppError } from '../utils/errorHandler.js';

const studyDao = {
    createStudy: async (studyData, thumbnailFile) => {
        try {
            const study = await Study.create(studyData);
            
            // 썸네일 이미지가 있는 경우 처리
            if (thumbnailFile) {
                await StudyThumbnail.create({
                    study_id: study.id,
                    filename: thumbnailFile.filename,
                    path: thumbnailFile.path,
                    size: thumbnailFile.size,
                    mimetype: thumbnailFile.mimetype
                });
            }
            
            logger.info('(studyDao.createStudy) 스터디 생성 완료', {
                studyId: study.id,
                userId: studyData.user_id,
                hasThumbnail: !!thumbnailFile,
                timestamp: new Date().toISOString()
            });

            return study;
        } catch (err) {
            logger.error('(studyDao.createStudy) 스터디 생성 실패', {
                error: err.toString(),
                studyData,
                timestamp: new Date().toISOString()
            });
            throw new AppError('스터디 생성 중 오류가 발생했습니다.', 500);
        }
    },

    findStudies: async (where = {}) => {
        try {
            const studies = await Study.findAll({
                where,
                include: [
                    {
                        model: Category,
                        as: 'Category',
                        attributes: ['id', 'name']
                    },
                    {
                        model: City,
                        as: 'City',
                        attributes: ['id', 'name']
                    },
                    {
                        model: User,
                        as: 'User',
                        attributes: ['userId', 'nickname']
                    },
                    {
                        model: District,
                        as: 'District',
                        attributes: ['id', 'name']
                    },
                    {
                        model: Town,
                        as: 'Town',
                        attributes: ['id', 'name']
                    },
                    {
                        model: StudyThumbnail,
                        as: 'StudyThumbnails',
                        attributes: ['path']
                    }
                ],
                order: [['created_at', 'DESC']],
                raw: false
            });

            logger.info('(studyDao.findStudies) 스터디 목록 조회 완료', {
                resultCount: studies.length,
                timestamp: new Date().toISOString()
            });

            return studies;
        } catch (err) {
            logger.error('(studyDao.findStudies) 스터디 목록 조회 실패', {
                error: err.toString(),
                errorMessage: err.message,
                stack: err.stack,
                timestamp: new Date().toISOString()
            });
            throw new AppError('스터디 목록 조회 중 오류가 발생했습니다.', 500);
        }
    },

    findStudyById: async (id) => {
        try {
            const study = await Study.findOne({
                where: { id },
                include: [
                    {
                        model: Category,
                        as: 'Category',
                        attributes: ['id', 'name']
                    },
                    {
                        model: City,
                        as: 'City',
                        attributes: ['id', 'name']
                    },
                    {
                        model: District,
                        as: 'District',
                        attributes: ['id', 'name']
                    },
                    {
                        model: Town,
                        as: 'Town',
                        attributes: ['id', 'name']
                    },
                    {
                        model: User,
                        as: 'User',
                        attributes: ['userId', 'nickname']
                    },
                    {
                        model: StudyThumbnail,
                        as: 'StudyThumbnails',
                        attributes: ['path']
                    }
                ]
            });

            logger.info('(studyDao.findStudyById) 스터디 상세 조회 완료', {
                studyId: id,
                found: !!study,
                timestamp: new Date().toISOString()
            });

            return study;
        } catch (err) {
            logger.error('(studyDao.findStudyById) 스터디 상세 조회 실패', {
                error: err.toString(),
                studyId: id,
                timestamp: new Date().toISOString()
            });
            throw new AppError('스터디 조회 중 오류가 발생했습니다.', 500);
        }
    },

    findStudyByIdAndUserId: async (id, userId) => {
        try {
            const study = await Study.findOne({
                where: { id, user_id: userId }
            });

            logger.info('(studyDao.findStudyByIdAndUserId) 스터디 작성자 확인 완료', {
                studyId: id,
                userId,
                found: !!study,
                timestamp: new Date().toISOString()
            });

            return study;
        } catch (err) {
            logger.error('(studyDao.findStudyByIdAndUserId) 스터디 작성자 확인 실패', {
                error: err.toString(),
                studyId: id,
                userId,
                timestamp: new Date().toISOString()
            });
            throw new AppError('스터디 조회 중 오류가 발생했습니다.', 500);
        }
    },

    updateStudy: async (study, updateData) => {
        try {
            const fieldsToUpdate = [
                'title', 'description', 'start_date', 'end_date',
                'max_participants', 'city_id', 'district_id', 'town_id',
                'category_id', 'status'
            ];

            const updateFields = {};
            fieldsToUpdate.forEach(field => {
                if (updateData[field] !== undefined && updateData[field] !== null) {
                    updateFields[field] = updateData[field];
                }
            });

            await study.update(updateFields);
            return study;
        } catch (err) {
            logger.error('(studyDao.updateStudy) 스터디 업데이트 실패', {
                error: err.toString(),
                studyId: study.id,
                timestamp: new Date().toISOString()
            });
            throw err;
        }
    },

    updateStudyThumbnail: async (studyId, thumbnailData) => {
        try {
            const existingThumbnail = await StudyThumbnail.findOne({
                where: { study_id: studyId }
            });

            if (!existingThumbnail) {
                throw new AppError('썸네일을 찾을 수 없습니다.', 404);
            }

            // 필요한 필드만 업데이트
            await existingThumbnail.update({
                path: thumbnailData.path,
                filename: thumbnailData.filename,
                size: thumbnailData.size,
                mimetype: thumbnailData.mimetype,
                updatedAt: new Date()
            });

            logger.info('(studyDao.updateStudyThumbnail) 썸네일 업데이트 완료', {
                studyId,
                thumbnailPath: thumbnailData.path,
                timestamp: new Date().toISOString()
            });

            return existingThumbnail;
        } catch (err) {
            logger.error('(studyDao.updateStudyThumbnail) 썸네일 업데이트 실패', {
                error: err.toString(),
                studyId,
                timestamp: new Date().toISOString()
            });
            throw err;
        }
    },

    createStudyThumbnail: async (studyId, thumbnailPath) => {
        try {
            const thumbnail = await StudyThumbnail.create({
                study_id: studyId,
                path: thumbnailPath,
                filename: thumbnailPath.split('/').pop(),
                size: 0, // 기본값 설정
                mimetype: 'image/png' // 기본값 설정
            });

            logger.info('(studyDao.createStudyThumbnail) 썸네일 생성 완료', {
                studyId,
                thumbnailPath,
                timestamp: new Date().toISOString()
            });

            return thumbnail;
        } catch (err) {
            logger.error('(studyDao.createStudyThumbnail) 썸네일 생성 실패', {
                error: err.toString(),
                studyId,
                thumbnailPath,
                timestamp: new Date().toISOString()
            });
            throw err;
        }
    },

    deleteStudyThumbnails: async (studyId) => {
        try {
            await StudyThumbnail.destroy({
                where: { study_id: studyId }
            });

            logger.info('(studyDao.deleteStudyThumbnails) 썸네일 삭제 완료', {
                studyId,
                timestamp: new Date().toISOString()
            });

            return true;
        } catch (err) {
            logger.error('(studyDao.deleteStudyThumbnails) 썸네일 삭제 실패', {
                error: err.toString(),
                studyId,
                timestamp: new Date().toISOString()
            });
            throw err;
        }
    },

    deleteStudy: async (study) => {
        try {
            await study.destroy();

            logger.info('(studyDao.deleteStudy) 스터디 삭제 완료', {
                studyId: study.id,
                timestamp: new Date().toISOString()
            });

            return true;
        } catch (err) {
            logger.error('(studyDao.deleteStudy) 스터디 삭제 실패', {
                error: err.toString(),
                studyId: study.id,
                timestamp: new Date().toISOString()
            });
            throw new AppError('스터디 삭제 중 오류가 발생했습니다.', 500);
        }
    },

    findEndedStudies: async () => {
        try {
            const studies = await Study.findAll({
                where: {
                    end_date: {
                        [Op.lt]: new Date()
                    }
                },
                include: [
                    {
                        model: Category,
                        as: 'Category'
                    },
                    {
                        model: City,
                        as: 'City'
                    },
                    {
                        model: User,
                        as: 'User',
                        attributes: ['userId', 'nickname']
                    }
                ],
                order: [['end_date', 'DESC']]
            });

            logger.info('(studyDao.findEndedStudies) 종료된 스터디 목록 조회 완료', {
                resultCount: studies.length,
                timestamp: new Date().toISOString()
            });

            return studies;
        } catch (err) {
            logger.error('(studyDao.findEndedStudies) 종료된 스터디 목록 조회 실패', {
                error: err.toString(),
                timestamp: new Date().toISOString()
            });
            throw new AppError('종료된 스터디 목록 조회 중 오류가 발생했습니다.', 500);
        }
    },

    findStudyApplication: async (studyId, userId) => {
        try {
            const application = await StudyApplication.findOne({
                where: {
                    study_id: studyId,
                    user_id: userId
                }
            });

            logger.info('(studyDao.findStudyApplication) 스터디 신청 조회 완료', {
                studyId,
                userId,
                found: !!application,
                timestamp: new Date().toISOString()
            });

            return application;
        } catch (err) {
            logger.error('(studyDao.findStudyApplication) 스터디 신청 조회 실패', {
                error: err.toString(),
                studyId,
                userId,
                timestamp: new Date().toISOString()
            });
            throw new AppError('스터디 신청 조회 중 오류가 발생했습니다.', 500);
        }
    },

    getEndedStudies: async (userId) => {
        try {
            const studies = await Study.findAll({
                where: {
                    end_date: {
                        [Op.lt]: new Date()
                    },
                    [Op.or]: [
                        { user_id: userId },  // 사용자가 생성한 스터디
                        { '$StudyApplications.user_id$': userId }  // 사용자가 신청한 스터디
                    ]
                },
                include: [
                    {
                        model: User,
                        as: 'User',
                        attributes: ['userId', 'nickname']
                    },
                    {
                        model: Category,
                        as: 'Category',
                        attributes: ['name']
                    },
                    {
                        model: City,
                        as: 'City',
                        attributes: ['name']
                    },
                    {
                        model: StudyApplication,
                        as: 'StudyApplications',
                        where: { user_id: userId },
                        required: false
                    }
                ],
                order: [['end_date', 'DESC']]
            });

            return studies;
        } catch (err) {
            logger.error('(studyDao.getEndedStudies)', {
                error: err.toString(),
                userId
            });
            throw new AppError('종료된 스터디 조회 중 오류가 발생했습니다.', 500);
        }
    },

    // 승인된(approved) 참여자만 반환
    findApprovedParticipants: async (studyId) => {
        try {
            const applications = await StudyApplication.findAll({
                where: { study_id: studyId, status: 'approved' },
                include: [{
                    model: User,
                    as: 'User',
                    attributes: ['id', 'userId', 'nickname']
                }]
            });
            return applications;
        } catch (err) {
            logger.error('(studyDao.findApprovedParticipants) 승인된 참여자 조회 실패', {
                error: err.toString(),
                studyId,
                timestamp: new Date().toISOString()
            });
            throw new AppError('승인된 참여자 조회 중 오류가 발생했습니다.', 500);
        }
    },

    async findStudiesByUserId(userId) {
        try {
            logger.info('(studyDao.findStudiesByUserId) 내가 만든 스터디 조회 시작', {
                userId,
                timestamp: new Date().toISOString()
            });

            const studies = await Study.findAll({
                where: { 
                    user_id: userId,
                    deleted_at: null  // 삭제되지 않은 스터디만 조회
                },
                attributes: [
                    'id', 'title', 'description', 'max_participants',
                    'start_date', 'end_date', 'created_at', 'updated_at'
                ],
                include: [
                    {
                        model: Category,
                        as: 'Category',
                        attributes: ['name']
                    },
                    {
                        model: City,
                        as: 'City',
                        attributes: ['name']
                    },
                    {
                        model: District,
                        as: 'District',
                        attributes: ['name']
                    },
                    {
                        model: Town,
                        as: 'Town',
                        attributes: ['name']
                    },
                    {
                        model: StudyThumbnail,
                        as: 'StudyThumbnails',
                        attributes: ['path']
                    },
                    {
                        model: User,
                        as: 'User',
                        attributes: ['id', 'userId', 'nickname']
                    },
                    {
                        model: StudyApplication,
                        as: 'StudyApplications',
                        include: [{
                            model: User,
                            as: 'User',
                            attributes: ['id', 'userId', 'nickname']
                        }]
                    }
                ],
                order: [['created_at', 'DESC']]
            });

            // 참여자 정보 가공
            const studiesWithParticipants = studies.map(study => {
                const studyJson = study.toJSON();
                const participants = studyJson.StudyApplications
                    .filter(app => app.status === 'approved' || app.status === 'pending')
                    .map(app => ({
                        id: app.User.id,
                        userId: app.User.userId,
                        nickname: app.User.nickname,
                        status: app.status,
                        isAuthor: false
                    }));

                // 작성자 정보 추가
                participants.unshift({
                    id: studyJson.User.id,
                    userId: studyJson.User.userId,
                    nickname: studyJson.User.nickname,
                    isAuthor: true
                });

                // 현재 참여자 수 계산
                const currentParticipants = participants.filter(p => 
                    (p.status === 'approved' || p.isAuthor) && p.status !== 'kicked'
                ).length;

                return {
                    ...studyJson,
                    current_participants: currentParticipants,
                    participants: participants,
                    StudyApplications: undefined // 불필요한 필드 제거
                };
            });

            logger.info('(studyDao.findStudiesByUserId) 내가 만든 스터디 조회 완료', {
                userId,
                studyCount: studies.length,
                timestamp: new Date().toISOString()
            });

            return studiesWithParticipants;
        } catch (error) {
            logger.error('(studyDao.findStudiesByUserId) 내가 만든 스터디 조회 실패', {
                error: error.toString(),
                errorMessage: error.message,
                errorStack: error.stack,
                userId,
                timestamp: new Date().toISOString()
            });
            throw new AppError('내가 만든 스터디 조회 중 오류가 발생했습니다.', 500);
        }
    }
};

export default studyDao; 