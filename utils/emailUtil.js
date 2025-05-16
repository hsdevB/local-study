import nodemailer from 'nodemailer';
import logger from './logger.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const emailUtil = {
  sendPasswordResetEmail: async (email, tempPassword) => {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: '비밀번호 재설정 안내',
        html: `
          <h1>비밀번호 재설정 안내</h1>
          <p>임시 비밀번호가 발급되었습니다.</p>
          <p>임시 비밀번호: <strong>${tempPassword}</strong></p>
          <p>보안을 위해 로그인 후 반드시 비밀번호를 변경해주세요.</p>
        `
      };

      await transporter.sendMail(mailOptions);
      logger.info('(emailUtil.sendPasswordResetEmail)', {
        email,
        status: 'success'
      });
    } catch (err) {
      logger.error('(emailUtil.sendPasswordResetEmail)', {
        error: err.toString(),
        email
      });
      throw new Error('이메일 발송 중 오류가 발생했습니다.');
    }
  }
};

export default emailUtil; 