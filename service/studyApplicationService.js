import studyApplicationDao from '../dao/studyApplicationDao.js';
import studyDao from '../dao/studyDao.js';
import logger from '../utils/logger.js';

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
    if (status === 'accepted') status = 'approved';
    const application = await studyApplicationDao.getApplicationById(applicationId);
    if (!application) {
      throw new Error('존재하지 않는 신청입니다.');
    }
    const study = await studyDao.getStudyById(application.study_id);
    if (study.user_id !== userId) {
      throw new Error('스터디 생성자만 신청 상태를 변경할 수 있습니다.');
    }
    // approved로 변경 시 정원 체크
    if (status === 'approved') {
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
    if (application.status === 'rejected' || application.status === 'kicked') {
      throw new Error('이미 거절되거나 추방된 신청은 취소할 수 없습니다.');
    }
    await studyApplicationDao.deleteApplication(applicationId, userId);
    return true;
  }

  // HTTP 핸들러: 스터디 참가 신청
  async applyForStudyHandler(req, res) {
    try {
      const { studyId } = req.params;
      const userId = req.user.id;

      // 스터디 정보 조회
      const study = await studyDao.findStudyById(studyId);
      if (!study) {
        return res.status(404).json({ success: false, message: '존재하지 않는 스터디입니다.' });
      }

      // 스터디 생성자가 자신의 스터디에 신청하는 경우 방지
      if (study.user_id === userId) {
        logger.warn('(studyApplicationService.applyForStudyHandler) 스터디 생성자의 참가 신청 시도', {
          studyId,
          userId,
          timestamp: new Date().toISOString()
        });
        return res.status(400).json({ success: false, message: '자신이 생성한 스터디에는 참가 신청할 수 없습니다.' });
      }

      // 이미 신청한 스터디인지 확인
      const isDuplicate = await studyApplicationDao.checkDuplicateApplication(studyId, userId);
      if (isDuplicate) {
        return res.status(400).json({ success: false, message: '이미 신청한 스터디입니다.' });
      }

      // 스터디 신청 생성
      const application = await studyApplicationDao.createApplication(studyId, userId);

      logger.info('(studyApplicationService.applyForStudyHandler) 스터디 참가 신청 완료', {
        studyId,
        userId,
        applicationId: application.id,
        timestamp: new Date().toISOString()
      });

      res.status(201).json({
        success: true,
        message: '스터디 참가 신청이 완료되었습니다.',
        data: application
      });
    } catch (err) {
      logger.error('(studyApplicationService.applyForStudyHandler) 스터디 참가 신청 실패', {
        error: err.toString(),
        studyId: req.params.studyId,
        userId: req.user?.id,
        timestamp: new Date().toISOString()
      });
      res.status(500).json({ success: false, message: '스터디 참가 신청 중 오류가 발생했습니다.' });
    }
  }

  // HTTP 핸들러: 내가 신청한 스터디 목록 조회
  async getMyApplicationsHandler(req, res) {
    try {
      const userId = req.user.id;
      const applications = await studyApplicationDao.getApplicationsByUser(userId);
      
      logger.info('(studyApplicationService.getMyApplicationsHandler) 내가 신청한 스터디 목록 조회 완료', {
        userId,
        count: applications.length,
        timestamp: new Date().toISOString()
      });

      res.status(200).json({
        success: true,
        data: applications
      });
    } catch (error) {
      logger.error('(studyApplicationService.getMyApplicationsHandler) 내가 신청한 스터디 목록 조회 실패', {
        error: error.toString(),
        userId: req.user?.id,
        timestamp: new Date().toISOString()
      });
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

      // 스터디 생성자 확인
      const study = await studyDao.findStudyById(studyId);
      if (!study) {
        return res.status(404).json({ success: false, message: '존재하지 않는 스터디입니다.' });
      }
      if (study.user_id !== userId) {
        return res.status(403).json({ success: false, message: '스터디 생성자만 참가 신청 목록을 조회할 수 있습니다.' });
      }

      const applications = await studyApplicationDao.getApplicationsByStudy(studyId);
      
      logger.info('(studyApplicationService.getStudyApplicationsHandler) 스터디 참가 신청 목록 조회 완료', {
        studyId,
        userId,
        count: applications.length,
        timestamp: new Date().toISOString()
      });

      res.status(200).json({
        success: true,
        data: applications
      });
    } catch (error) {
      logger.error('(studyApplicationService.getStudyApplicationsHandler) 스터디 참가 신청 목록 조회 실패', {
        error: error.toString(),
        studyId: req.params.studyId,
        userId: req.user?.id,
        timestamp: new Date().toISOString()
      });
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
      let { status } = req.body;
      const userId = req.user.id;
      if (status === 'accepted') status = 'approved';
      if (!['approved', 'rejected'].includes(status)) {
        throw new Error('유효하지 않은 상태값입니다.');
      }

      // 신청 정보 조회
      const application = await studyApplicationDao.getApplicationById(applicationId);
      if (!application) {
        return res.status(404).json({ success: false, message: '존재하지 않는 신청입니다.' });
      }

      // 스터디 생성자 확인
      const study = await studyDao.findStudyById(application.study_id);
      if (!study) {
        return res.status(404).json({ success: false, message: '존재하지 않는 스터디입니다.' });
      }
      if (study.user_id !== userId) {
        logger.warn('(studyApplicationService.updateApplicationStatusHandler) 스터디 생성자가 아닌 사용자의 상태 변경 시도', {
          applicationId,
          userId,
          studyId: study.id,
          timestamp: new Date().toISOString()
        });
        return res.status(403).json({ success: false, message: '스터디 생성자만 신청 상태를 변경할 수 있습니다.' });
      }

      // approved로 변경 시 정원 체크
      if (status === 'approved') {
        const acceptedCount = await studyApplicationDao.countAcceptedApplications(study.id);
        if (acceptedCount >= study.max_participants) {
          return res.status(400).json({ success: false, message: '스터디 정원이 초과되어 더 이상 수락할 수 없습니다.' });
        }

        // 현재 참가자 수 업데이트
        await studyDao.updateStudy(study, {
          current_participants: study.current_participants + 1
        });
      }
      
      const result = await studyApplicationDao.updateApplicationStatus(applicationId, status);
      
      logger.info('(studyApplicationService.updateApplicationStatusHandler) 참가 신청 상태 업데이트 완료', {
        applicationId,
        status,
        userId,
        studyId: study.id,
        currentParticipants: study.current_participants,
        timestamp: new Date().toISOString()
      });

      res.status(200).json({
        success: true,
        message: `참가 신청이 ${status === 'approved' ? '수락' : '거절'}되었습니다.`,
        data: result
      });
    } catch (error) {
      logger.error('(studyApplicationService.updateApplicationStatusHandler) 참가 신청 상태 업데이트 실패', {
        error: error.toString(),
        applicationId: req.params.applicationId,
        userId: req.user?.id,
        timestamp: new Date().toISOString()
      });
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

      // 신청 정보 조회
      const application = await studyApplicationDao.getApplicationById(applicationId);
      if (!application) {
        return res.status(404).json({ success: false, message: '존재하지 않는 신청입니다.' });
      }

      // 본인 신청인지 확인
      if (application.user_id !== userId) {
        logger.warn('(studyApplicationService.cancelApplicationHandler) 다른 사용자의 신청 취소 시도', {
          applicationId,
          userId,
          applicationUserId: application.user_id,
          timestamp: new Date().toISOString()
        });
        return res.status(403).json({ success: false, message: '본인만 신청을 취소할 수 있습니다.' });
      }

      // 이미 취소된 신청인지 확인
      if (application.status === 'cancelled') {
        return res.status(400).json({ success: false, message: '이미 취소된 신청입니다.' });
      }

      // approved 상태에서 취소하는 경우 참가자 수 감소
      if (application.status === 'approved') {
        const study = await studyDao.findStudyById(application.study_id);
        if (!study) {
          return res.status(404).json({ success: false, message: '존재하지 않는 스터디입니다.' });
        }

        // 현재 참가자 수가 0보다 큰 경우에만 감소
        if (study.current_participants > 0) {
          await studyDao.updateStudy(study, {
            current_participants: study.current_participants - 1
          });
        }
      }

      // 신청 취소 처리
      await studyApplicationDao.deleteApplication(applicationId, userId);
      
      logger.info('(studyApplicationService.cancelApplicationHandler) 참가 신청 취소 완료', {
        applicationId,
        userId,
        previousStatus: application.status,
        timestamp: new Date().toISOString()
      });

      res.status(200).json({ 
        success: true, 
        message: '신청이 취소되었습니다.' 
      });
    } catch (error) {
      logger.error('(studyApplicationService.cancelApplicationHandler) 참가 신청 취소 실패', {
        error: error.toString(),
        applicationId: req.params.applicationId,
        userId: req.user?.id,
        timestamp: new Date().toISOString()
      });
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // 내가 만든(운영하는) 스터디 목록 조회
  async getMyCreatedStudiesHandler(req, res) {
    try {
      const userId = req.user.id;
      // Study 테이블에서 user_id가 본인인 스터디 목록 조회 (참가자 정보 포함)
      const studies = await studyDao.findStudiesByUserId(userId);
      
      logger.info('(studyApplicationService.getMyCreatedStudiesHandler) 내가 만든 스터디 목록 조회 완료', {
        userId,
        count: studies.length,
        timestamp: new Date().toISOString()
      });

      res.status(200).json({
        success: true,
        data: studies
      });
    } catch (error) {
      logger.error('(studyApplicationService.getMyCreatedStudiesHandler) 내가 만든 스터디 목록 조회 실패', {
        error: error.toString(),
        userId: req.user?.id,
        timestamp: new Date().toISOString()
      });
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new StudyApplicationService(); 