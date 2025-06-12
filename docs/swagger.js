/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - userId
 *         - nickname
 *         - email
 *       properties:
 *         userId:
 *           type: string
 *           description: 사용자 아이디
 *         nickname:
 *           type: string
 *           description: 사용자 닉네임
 *         email:
 *           type: string
 *           description: 사용자 이메일
 *     Study:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - categoryId
 *         - cityId
 *         - districtId
 *         - townId
 *       properties:
 *         id:
 *           type: integer
 *           description: 스터디 ID
 *         title:
 *           type: string
 *           description: 스터디 제목
 *         description:
 *           type: string
 *           description: 스터디 설명
 *         categoryId:
 *           type: integer
 *           description: 카테고리 ID
 *         cityId:
 *           type: integer
 *           description: 도시 ID
 *         districtId:
 *           type: integer
 *           description: 구/군 ID
 *         townId:
 *           type: integer
 *           description: 동/읍/면 ID
 *         maxParticipants:
 *           type: integer
 *           description: 최대 참가자 수
 *         currentParticipants:
 *           type: integer
 *           description: 현재 참가자 수
 *         status:
 *           type: string
 *           enum: [active, completed, deleted]
 *           description: 스터디 상태
 *     StudyApplication:
 *       type: object
 *       required:
 *         - studyId
 *         - userId
 *       properties:
 *         id:
 *           type: integer
 *           description: 신청 ID
 *         studyId:
 *           type: integer
 *           description: 스터디 ID
 *         userId:
 *           type: string
 *           description: 신청자 ID
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected, cancelled, kicked]
 *           description: 신청 상태
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 카테고리 ID
 *         name:
 *           type: string
 *           description: 카테고리 이름
 *     City:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 도시 ID
 *         name:
 *           type: string
 *           description: 도시 이름
 *     District:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 구/군 ID
 *         name:
 *           type: string
 *           description: 구/군 이름
 *         cityId:
 *           type: integer
 *           description: 소속 도시 ID
 *     Town:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 동/읍/면 ID
 *         name:
 *           type: string
 *           description: 동/읍/면 이름
 *         districtId:
 *           type: integer
 *           description: 소속 구/군 ID
 *     Error:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: 에러 메시지
 */

/**
 * @swagger
 * tags:
 *   name: User
 *   description: 사용자 관련 API
 *   name: Study
 *   description: 스터디 관련 API
 *   name: StudyApplication
 *   description: 스터디 신청 관련 API
 *   name: Location
 *   description: 지역 정보 관련 API
 */

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: 사용자 로그인
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - password
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "user123"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: 사용자 프로필 조회
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 프로필 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: 인증되지 않은 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /user/info:
 *   put:
 *     summary: 사용자 정보 수정
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "newUserId"
 *               nickname:
 *                 type: string
 *                 example: "newNickname"
 *               email:
 *                 type: string
 *                 example: "new@email.com"
 *               password:
 *                 type: string
 *                 example: "newPassword123"
 *     responses:
 *       200:
 *         description: 정보 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: 인증되지 않은 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /user/password:
 *   put:
 *     summary: 비밀번호 변경
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: "currentPassword123"
 *               newPassword:
 *                 type: string
 *                 example: "newPassword123"
 *     responses:
 *       200:
 *         description: 비밀번호 변경 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "비밀번호가 성공적으로 변경되었습니다."
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: 인증되지 않은 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /user/withdraw:
 *   delete:
 *     summary: 회원 탈퇴
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 회원 탈퇴 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "회원 탈퇴가 완료되었습니다."
 *       401:
 *         description: 인증되지 않은 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /user/refresh-token:
 *   post:
 *     summary: 토큰 갱신
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - userId
 *             properties:
 *               token:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIs..."
 *               userId:
 *                 type: string
 *                 example: "user123"
 *     responses:
 *       200:
 *         description: 토큰 갱신 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /user/logout:
 *   post:
 *     summary: 로그아웃
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "로그아웃되었습니다."
 *       401:
 *         description: 인증되지 않은 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: 회원가입
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - password
 *               - nickname
 *               - email
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "user123"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               nickname:
 *                 type: string
 *                 example: "닉네임"
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "회원가입이 완료되었습니다."
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /password-reset/request:
 *   post:
 *     summary: 비밀번호 재설정 요청
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: 비밀번호 재설정 이메일 발송 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "비밀번호 재설정 이메일이 발송되었습니다."
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /study:
 *   get:
 *     summary: 스터디 목록 조회
 *     tags: [Study]
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: 카테고리 ID
 *       - in: query
 *         name: cityId
 *         schema:
 *           type: integer
 *         description: 도시 ID
 *       - in: query
 *         name: districtId
 *         schema:
 *           type: integer
 *         description: 구/군 ID
 *       - in: query
 *         name: townId
 *         schema:
 *           type: integer
 *         description: 동/읍/면 ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 검색어
 *     responses:
 *       200:
 *         description: 스터디 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Study'
 *   post:
 *     summary: 스터디 생성
 *     tags: [Study]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Study'
 *     responses:
 *       201:
 *         description: 스터디 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Study'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: 인증되지 않은 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /study/{id}:
 *   get:
 *     summary: 스터디 상세 조회
 *     tags: [Study]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 스터디 ID
 *     responses:
 *       200:
 *         description: 스터디 상세 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Study'
 *       404:
 *         description: 스터디를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: 스터디 삭제
 *     tags: [Study]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 스터디 ID
 *     responses:
 *       200:
 *         description: 스터디 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "스터디가 삭제되었습니다."
 *       401:
 *         description: 인증되지 않은 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 스터디를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /study-application:
 *   post:
 *     summary: 스터디 참여 신청
 *     tags: [StudyApplication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studyId
 *             properties:
 *               studyId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: 스터디 참여 신청 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/StudyApplication'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: 인증되지 않은 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /study-application/{id}:
 *   delete:
 *     summary: 스터디 참여 신청 취소
 *     tags: [StudyApplication]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 신청 ID
 *     responses:
 *       200:
 *         description: 스터디 참여 신청 취소 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "스터디 참여 신청이 취소되었습니다."
 *       401:
 *         description: 인증되지 않은 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 신청을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /category:
 *   get:
 *     summary: 카테고리 목록 조회
 *     tags: [Location]
 *     responses:
 *       200:
 *         description: 카테고리 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 */

/**
 * @swagger
 * /city:
 *   get:
 *     summary: 도시 목록 조회
 *     tags: [Location]
 *     responses:
 *       200:
 *         description: 도시 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/City'
 */

/**
 * @swagger
 * /district/{cityId}:
 *   get:
 *     summary: 구/군 목록 조회
 *     tags: [Location]
 *     parameters:
 *       - in: path
 *         name: cityId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 도시 ID
 *     responses:
 *       200:
 *         description: 구/군 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/District'
 */

/**
 * @swagger
 * /town/{districtId}:
 *   get:
 *     summary: 동/읍/면 목록 조회
 *     tags: [Location]
 *     parameters:
 *       - in: path
 *         name: districtId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 구/군 ID
 *     responses:
 *       200:
 *         description: 동/읍/면 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Town'
 */ 