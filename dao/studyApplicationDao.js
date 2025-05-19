import StudyApplication from '../models/studyApplication.js';
import Study from '../models/study.js';
import User from '../models/user.js';
import logger from '../utils/logger.js';

class StudyApplicationDao {
  // 스터디 참가 신청 생성
  async createApplication(studyId, userId) {
    return await StudyApplication.create({
      study_id: studyId,
      user_id: userId,
      status: 'pending',
      applied_at: new Date()
    });
  }

  // 사용자의 참가 신청 목록 조회
  async getApplicationsByUser(userId) {
    return await StudyApplication.findAll({
      where: { user_id: userId },
      include: [{
        model: Study,
        as: 'Study',
        attributes: ['id', 'title', 'description', 'start_date', 'end_date', 'max_participants']
      }]
    });
  }

  // 스터디의 참가 신청 목록 조회
  async getApplicationsByStudy(studyId) {
    return await StudyApplication.findAll({
      where: { study_id: studyId },
      include: [{
        model: User,
        as: 'User',
        attributes: ['nickname']
      }]
    });
  }

  // 참가 신청 상태 업데이트
  async updateApplicationStatus(applicationId, status) {
    return await StudyApplication.update(
      { status },
      { where: { id: applicationId } }
    );
  }

  // 중복 신청 체크
  async checkDuplicateApplication(studyId, userId) {
    const application = await StudyApplication.findOne({
      where: { 
        study_id: studyId, 
        user_id: userId 
      }
    });
    return application !== null;
  }

  // 신청 정보 조회
  async getApplicationById(applicationId) {
    return await StudyApplication.findByPk(applicationId);
  }

  // 신청 취소
  async deleteApplication(applicationId, userId) {
    return await StudyApplication.destroy({
      where: {
        id: applicationId,
        user_id: userId
      }
    });
  }

  // accepted 상태 신청자 수 카운트
  async countAcceptedApplications(studyId) {
    return await StudyApplication.count({
      where: {
        study_id: studyId,
        status: 'accepted'
      }
    });
  }

  // 스터디와 사용자 ID로 신청 내역 조회
  async findApplicationByStudyAndUser(studyId, userId) {
    try {
      const application = await StudyApplication.findOne({
        where: {
          study_id: studyId,
          user_id: userId
        }
      });
      return application;
    } catch (error) {
      logger.error('(studyApplicationDao.findApplicationByStudyAndUser) 신청 내역 조회 실패', {
        error: error.toString(),
        studyId,
        userId,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }
}

export default new StudyApplicationDao(); 