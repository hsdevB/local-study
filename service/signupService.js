import signupDao from '../dao/signupDao.js';
import hashUtil from '../utils/hashUtil.js';
import logger from '../utils/logger.js';
import { AppError } from '../utils/errorHandler.js';
import nodemailer from 'nodemailer'

// 인증 코드 임시 저장 (실서비스는 Redis 등 사용 권장)
const emailCodeStore = {}

const signupService = {
    async createUser(params) {
        try {
            // 1. 기본 유효성 검사
            if (params.userId.length < 3) {
                throw new Error('아이디는 3자 이상이어야 합니다.');
            }

            // 1-1. 영어와 숫자만 허용 (정규식 사용)
            if (!/^[a-zA-Z0-9]+$/.test(params.userId)) {
              throw new Error('아이디는 영어와 숫자만 사용할 수 있습니다.');
            }
            
            // 2. 이메일 형식 검사
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(params.email)) {
                throw new Error('올바른 이메일 형식이 아닙니다.');
            }

            // 3. 전화번호 형식 검사 (예: 010-1234-5678)
            const phoneRegex = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/;
            if (!phoneRegex.test(params.phoneNumber)) {
                throw new AppError('올바른 전화번호 형식이 아닙니다.', 400);
            }

            // 4. 비밀번호 복잡도 검사 (예: 8자 이상, 영문/숫자/특수문자 포함)
            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
            if (!passwordRegex.test(params.password)) {
                throw new Error('비밀번호는 8자 이상이며, 영문/숫자/특수문자를 포함해야 합니다.');
            }

            // 5. 중복 ID 검사
            const existingUser = await signupDao.findByUserId(params.userId);
            if (existingUser) {
                throw new AppError('이미 존재하는 아이디입니다.', 400);
            }

            // 6. 중복 이메일 검사
            const existingEmail = await signupDao.findByEmail(params.email);
            if (existingEmail) {
                throw new AppError('이미 존재하는 이메일입니다.', 400);
            }

            // 7. 비밀번호 해싱
            const hashedPassword = await hashUtil.makePasswordHash(params.password);
            params.password = hashedPassword;

            // 8. 사용자 생성
            const user = await signupDao.createUser(params);
            
            logger.info('(signupService.createUser) 회원가입 완료', {
                userId: params.userId,
                email: params.email,
                timestamp: new Date().toISOString()
            });

            return user;
        } catch (err) {
            logger.error('(signupService.createUser) 회원가입 실패', {
                error: err.toString(),
                params: {
                    userId: params.userId,
                    email: params.email
                },
                timestamp: new Date().toISOString()
            });
            throw err;
        }
    },

    async createUserHandler(req, res) {
        try {
            const params = {
                userId: req.body.userId,
                password: req.body.password,
                nickname: req.body.nickname,
                email: req.body.email,
                phoneNumber: req.body.phoneNumber,
                birthDate: req.body.birthDate,
                gender: req.body.gender,
            };
            // 필수 입력값 검증
            if (!params.userId || !params.password || !params.nickname || 
                !params.email || !params.phoneNumber || !params.birthDate || !params.gender) {
                return res.status(400).json({ success: false, message: '사용자 아이디, 비밀번호, 닉네임, 이메일, 전화번호, 생년월일, 성별은 필수 입력값입니다.' });
            }
            // 입력값 형식 검증
            // (기존 validationUtil.validateUserId 등은 내부에서 호출)
            const user = await this.createUser(params);
            res.status(201).json({
                success: true,
                message: '회원가입이 완료되었습니다.',
                data: {
                    userId: user.userId,
                    email: user.email,
                    nickname: user.nickname
                }
            });
        } catch (err) {
            res.status(500).json({ success: false, message: '회원가입 처리 중 오류가 발생했습니다.' });
        }
    },
    async checkUserId(req, res) {
        try {
            const { userId } = req.query;
            if (!userId) {
                return res.status(400).json({ success: false, message: 'userId는 필수입니다.' });
            }
            const user = await signupDao.findByUserId(userId);
            res.status(200).json({ success: true, available: !user });
        } catch (err) {
            res.status(500).json({ success: false, message: '아이디 중복 검사 중 오류가 발생했습니다.' });
        }
    },
    async checkEmail(req, res) {
        try {
            const { email } = req.query;
            if (!email) {
                return res.status(400).json({ success: false, message: 'email은 필수입니다.' });
            }
            const user = await signupDao.findByEmail(email);
            res.status(200).json({ success: true, available: !user });
        } catch (err) {
            res.status(500).json({ success: false, message: '이메일 중복 검사 중 오류가 발생했습니다.' });
        }
    },
    async sendEmailCode(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ success: false, message: 'email은 필수입니다.' });
            }
            // 이미 가입된 이메일인지 확인
            const user = await signupDao.findByEmail(email);
            if (user) {
                return res.status(400).json({ success: false, message: '이미 회원가입된 이메일입니다.' });
            }
            // 인증 코드 생성 (6자리 숫자)
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            emailCodeStore[email] = code;
            // Nodemailer로 이메일 발송
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                }
            });
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: '[LocalStudy] 이메일 인증 코드',
                text: `인증 코드: ${code}`
            });
            res.status(200).json({ success: true, message: '인증 코드가 이메일로 발송되었습니다.' });
        } catch (err) {
            res.status(500).json({ success: false, message: '이메일 인증 코드 발송 중 오류가 발생했습니다.' });
        }
    },
    async verifyEmailCode(req, res) {
        try {
            const { email, code } = req.body;
            if (!email || !code) {
                return res.status(400).json({ success: false, message: 'email과 code는 필수입니다.' });
            }
            if (emailCodeStore[email] && emailCodeStore[email] === code) {
                delete emailCodeStore[email]; // 인증 성공 시 삭제
                return res.status(200).json({ success: true, message: '이메일 인증이 완료되었습니다.' });
            } else {
                return res.status(400).json({ success: false, message: '인증 코드가 올바르지 않습니다.' });
            }
        } catch (err) {
            res.status(500).json({ success: false, message: '이메일 인증 코드 검증 중 오류가 발생했습니다.' });
        }
    },
    async checkNickname(req, res) {
        try {
            const { nickname } = req.query;
            if (!nickname) {
                return res.status(400).json({ success: false, message: 'nickname은 필수입니다.' });
            }
            const user = await signupDao.findByNickname(nickname);
            res.status(200).json({ success: true, available: !user });
        } catch (err) {
            res.status(500).json({ success: false, message: '닉네임 중복 검사 중 오류가 발생했습니다.' });
        }
    },
};

export default signupService;