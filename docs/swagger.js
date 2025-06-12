/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - userId
 *         - password
 *         - nickname
 *         - email
 *         - phoneNumber
 *         - birthDate
 *         - gender
 *       properties:
 *         userId:
 *           type: string
 *           description: 사용자 아이디 (3자 이상, 영문/숫자만 허용)
 *           minLength: 3
 *           pattern: '^[a-zA-Z0-9]+$'
 *         password:
 *           type: string
 *           description: 비밀번호 (8자 이상, 영문/숫자/특수문자 포함)
 *           minLength: 8
 *           pattern: '^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$'
 *         nickname:
 *           type: string
 *           description: 사용자 닉네임
 *         email:
 *           type: string
 *           description: 사용자 이메일
 *           format: email
 *         phoneNumber:
 *           type: string
 *           description: 전화번호 (010-XXXX-XXXX 형식)
 *           pattern: '^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$'
 *         birthDate:
 *           type: string
 *           description: 생년월일
 *           format: date
 *         gender:
 *           type: string
 *           description: 성별
 *           enum: [M, F]
 *     Study:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - categoryId
 *         - cityId
 *         - districtId
 *         - townId
 *         - maxParticipants
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
 *           minimum: 1
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
 *                 description: 사용자 아이디 (3자 이상, 영문/숫자만 허용)
 *                 minLength: 3
 *                 pattern: '^[a-zA-Z0-9]+$'
 *                 example: "newUserId"
 *               nickname:
 *                 type: string
 *                 description: 사용자 닉네임
 *                 example: "newNickname"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 사용자 이메일
 *                 example: "new@email.com"
 *               phoneNumber:
 *                 type: string
 *                 description: 전화번호 (010-XXXX-XXXX 형식)
 *                 pattern: '^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$'
 *                 example: "010-1234-5678"
 *               password:
 *                 type: string
 *                 description: 새 비밀번호 (8자 이상, 영문/숫자/특수문자 포함)
 *                 minLength: 8
 *                 pattern: '^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$'
 *                 example: "NewPassword123!"
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
 *                 message:
 *                   type: string
 *                   example: "회원정보가 성공적으로 수정되었습니다."
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
 *                 description: 현재 비밀번호
 *                 example: "currentPassword123"
 *               newPassword:
 *                 type: string
 *                 description: 새 비밀번호 (8자 이상, 영문/숫자/특수문자 포함)
 *                 minLength: 8
 *                 pattern: '^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$'
 *                 example: "NewPassword123!"
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
 *       404:
 *         description: 사용자를 찾을 수 없음
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
 *                 description: 사용자 아이디
 *                 example: "user123"
 *               password:
 *                 type: string
 *                 description: 현재 비밀번호
 *                 example: "currentPassword123"
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
 *       404:
 *         description: 사용자를 찾을 수 없음
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
 *               - phoneNumber
 *               - birthDate
 *               - gender
 *             properties:
 *               userId:
 *                 type: string
 *                 description: 사용자 아이디 (3자 이상, 영문/숫자만 허용)
 *                 minLength: 3
 *                 pattern: '^[a-zA-Z0-9]+$'
 *                 example: "user123"
 *               password:
 *                 type: string
 *                 description: 비밀번호 (8자 이상, 영문/숫자/특수문자 포함)
 *                 minLength: 8
 *                 pattern: '^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$'
 *                 example: "Password123!"
 *               nickname:
 *                 type: string
 *                 description: 사용자 닉네임
 *                 example: "닉네임"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 사용자 이메일
 *                 example: "user@example.com"
 *               phoneNumber:
 *                 type: string
 *                 description: 전화번호 (010-XXXX-XXXX 형식)
 *                 pattern: '^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$'
 *                 example: "010-1234-5678"
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 description: 생년월일
 *                 example: "1990-01-01"
 *               gender:
 *                 type: string
 *                 enum: [M, F]
 *                 description: 성별
 *                 example: "M"
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     email:
 *                       type: string
 *                     nickname:
 *                       type: string
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
 *               - userId
 *               - email
 *             properties:
 *               userId:
 *                 type: string
 *                 description: 사용자 아이디
 *                 example: "user123"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 사용자 이메일
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "임시 비밀번호가 이메일로 발송되었습니다."
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 사용자를 찾을 수 없음
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
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - categoryId
 *               - cityId
 *               - districtId
 *               - townId
 *               - maxParticipants
 *             properties:
 *               title:
 *                 type: string
 *                 description: 스터디 제목
 *                 example: "프로그래밍 스터디"
 *               description:
 *                 type: string
 *                 description: 스터디 설명
 *                 example: "주 2회 모여서 프로그래밍 공부를 합니다."
 *               categoryId:
 *                 type: integer
 *                 description: 카테고리 ID
 *                 example: 1
 *               cityId:
 *                 type: integer
 *                 description: 도시 ID
 *                 example: 1
 *               districtId:
 *                 type: integer
 *                 description: 구/군 ID
 *                 example: 1
 *               townId:
 *                 type: integer
 *                 description: 동/읍/면 ID
 *                 example: 1
 *               maxParticipants:
 *                 type: integer
 *                 description: 최대 참가자 수
 *                 minimum: 1
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
 * /study-application/{id}/status:
 *   put:
 *     summary: 스터디 참가 신청 상태 업데이트
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *                 description: 신청 상태
 *                 example: "approved"
 *     responses:
 *       200:
 *         description: 신청 상태 업데이트 성공
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
 *                   example: "참가 신청이 수락되었습니다."
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
 *       403:
 *         description: 권한 없음
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
 * /study-application/{id}/cancel:
 *   delete:
 *     summary: 스터디 참가 신청 취소
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
 *         description: 신청 취소 성공
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
 *                   example: "신청이 취소되었습니다."
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
 *       403:
 *         description: 권한 없음
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