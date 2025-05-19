import studyApplicationDao from '../dao/studyApplicationDao.js';
import studyDao from '../dao/studyDao.js';

class StudyApplicationService {
  // 스터디 참가 신청
  async applyForStudy(studyId, userId) {
    // 중복 신청 체크
    const isDuplicate = await studyApplicationDao.checkDuplicateApplication(studyId, userId);
    if (isDuplicate) {
      throw new Error('이미 신청한 스터디입니다.');
    }

    // 스터디 존재 여부 체크
    const study = await studyDao.getStudyById(studyId);
    if (!study) {
      throw new Error('존재하지 않는 스터디입니다.');
    }

    // 스터디 생성자 체크
    if (study.user_id === userId) {
      throw new Error('자신이 생성한 스터디에는 신청할 수 없습니다.');
    }

    return await studyApplicationDao.createApplication(studyId, userId);
  }

  // 사용자의 참가 신청 목록 조회
  async getMyApplications(userId) {
    return await studyApplicationDao.getApplicationsByUser(userId);
  }

  // 스터디의 참가 신청 목록 조회
  async getStudyApplications(studyId, userId) {
    // 스터디 생성자 체크
    const study = await studyDao.getStudyById(studyId);
    if (!study) {
      throw new Error('존재하지 않는 스터디입니다.');
    }
    if (study.user_id !== userId) {
      throw new Error('스터디 생성자만 참가 신청 목록을 조회할 수 있습니다.');
    }

    return await studyApplicationDao.getApplicationsByStudy(studyId);
  }

  // 참가 신청 상태 업데이트
  async updateApplicationStatus(applicationId, status, userId) {
    const application = await studyApplicationDao.getApplicationById(applicationId);
    if (!application) {
      throw new Error('존재하지 않는 신청입니다.');
    }
    const study = await studyDao.getStudyById(application.study_id);
    if (study.user_id !== userId) {
      throw new Error('스터디 생성자만 신청 상태를 변경할 수 있습니다.');
    }
    // accepted로 변경 시 정원 체크
    if (status === 'accepted') {
      const acceptedCount = await studyApplicationDao.countAcceptedApplications(study.id);
      if (acceptedCount >= study.max_participants) {
        throw new Error('스터디 정원이 초과되어 더 이상 수락할 수 없습니다.');
      }
    }
    return await studyApplicationDao.updateApplicationStatus(applicationId, status);
  }

  async cancelApplication(applicationId, userId) {
    const application = await studyApplicationDao.getApplicationById(applicationId);
    if (!application) throw new Error('존재하지 않는 신청입니다.');
    if (application.user_id !== userId) throw new Error('본인만 신청을 취소할 수 있습니다.');
    if (application.status !== 'pending') throw new Error('대기 상태만 취소할 수 있습니다.');
    await studyApplicationDao.deleteApplication(applicationId, userId);
    return true;
  }

  // HTTP 핸들러: 스터디 참가 신청
  async applyForStudyHandler(req, res) {
    try {
      const { studyId } = req.params;
      const userId = req.user.id;
      const result = await this.applyForStudy(studyId, userId);
      res.status(201).json({
        success: true,
        message: '스터디 참가 신청이 완료되었습니다.',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // HTTP 핸들러: 내가 신청한 스터디 목록 조회
  async getMyApplicationsHandler(req, res) {
    try {
      const userId = req.user.id;
      const applications = await this.getMyApplications(userId);
      res.status(200).json({
        success: true,
        data: applications
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // HTTP 핸들러: 스터디의 참가 신청 목록 조회
  async getStudyApplicationsHandler(req, res) {
    try {
      const { studyId } = req.params;
      const userId = req.user.id;
      const applications = await this.getStudyApplications(studyId, userId);
      res.status(200).json({
        success: true,
        data: applications
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // HTTP 핸들러: 참가 신청 상태 업데이트 (수락/거절)
  async updateApplicationStatusHandler(req, res) {
    try {
      const { applicationId } = req.params;
      const { status } = req.body;
      const userId = req.user.id;
      if (!['accepted', 'rejected'].includes(status)) {
        throw new Error('유효하지 않은 상태값입니다.');
      }
      const result = await this.updateApplicationStatus(applicationId, status, userId);
      res.status(200).json({
        success: true,
        message: `참가 신청이 ${status === 'accepted' ? '수락' : '거절'}되었습니다.`,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // HTTP 핸들러: 참가 신청 취소
  async cancelApplicationHandler(req, res) {
    try {
      const { applicationId } = req.params;
      const userId = req.user.id;
      await this.cancelApplication(applicationId, userId);
      res.status(200).json({ success: true, message: '신청이 취소되었습니다.' });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

export default new StudyApplicationService(); 