import StudyApplication from '../models/studyApplication.js';
import Study from '../models/study.js';
import User from '../models/user.js';
import Category from '../models/category.js';
import StudyThumbnail from '../models/studyThumbnail.js';
import City from '../models/city.js';
import District from '../models/district.js';
import Town from '../models/town.js';
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
        where: { deleted_at: null },  // 삭제되지 않은 스터디만 조회
        attributes: ['id', 'title', 'description', 'start_date', 'end_date', 'max_participants', 'current_participants'],
        include: [
          { model: Category, as: 'Category', attributes: ['id', 'name'] },
          { model: StudyThumbnail, as: 'StudyThumbnails', attributes: ['id', 'path'] },
          { model: City, as: 'City', attributes: ['id', 'name'] },
          { model: District, as: 'District', attributes: ['id', 'name'] },
          { model: Town, as: 'Town', attributes: ['id', 'name'] },
          { model: User, as: 'User', attributes: ['userId', 'nickname'] }
        ]
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

  // 신청 취소 및 추방
  async deleteApplication(applicationId, userId) {
    let userPk = userId;
    if (userId && isNaN(Number(userId))) {
      const user = await User.findOne({ where: { userId } });
      if (!user) throw new Error('해당 유저를 찾을 수 없습니다.');
      userPk = user.id;
    }
    const where = { id: applicationId };
    if (userId) where.user_id = userPk;
    return await StudyApplication.destroy({ where });
  }

  // accepted 상태 신청자 수 카운트
  async countAcceptedApplications(studyId) {
    return await StudyApplication.count({
      where: {
        study_id: studyId,
        status: 'approved'
      }
    });
  }

  // 스터디와 사용자 ID로 신청 내역 조회
  async findApplicationByStudyAndUser(studyId, userId) {
    try {
      let userPk = userId;
      if (isNaN(Number(userId))) {
        // userId가 숫자가 아니면, User 테이블에서 id(PK)를 조회
        const user = await User.findOne({ where: { userId } });
        if (!user) throw new Error('해당 유저를 찾을 수 없습니다.');
        userPk = user.id;
      }
      const application = await StudyApplication.findOne({
        where: {
          study_id: studyId,
          user_id: userPk
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

  // 신청 상태를 'kicked'로 변경
  async kickApplication(applicationId) {
    return await StudyApplication.update(
      { status: 'kicked' },
      { where: { id: applicationId } }
    );
  }
}

export default new StudyApplicationDao(); 