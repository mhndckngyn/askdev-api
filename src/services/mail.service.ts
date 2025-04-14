import { sendEmail } from '@/utils/sendEmail';

const MailService = {
  sendVerificationEmail: (to: string, token: string, expires: Date) => {
    const from = '"AskDev" <contact@askdev.com>';
    const subject = 'Xác nhận đăng ký tài khoản tại AskDev';
    const verificationLink = `http://localhost:5173/verify-email?token=${token}`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; background-color: #f8f9fa; padding: 40px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); padding: 32px;">
          <h2 style="color: #1c7ed6; margin-top: 0;">Chào mừng bạn đến với AskDev!</h2>
          <p style="font-size: 16px; color: #343a40;">
            Cảm ơn bạn đã đăng ký. Để bắt đầu, vui lòng xác nhận địa chỉ email của bạn bằng cách nhấn vào nút bên dưới.
          </p>
          <a href="${verificationLink}" style="display: inline-block; margin: 16px 0 24px; padding: 12px 20px; background-color: #228be6; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 500;">
            Xác nhận Email
          </a>
          <p style="font-size: 14px; color: #868e96;">
            Liên kết này sẽ hết hạn vào lúc <strong>${expires.toLocaleString()}</strong>.
          </p>
        </div>
      </div>
    `;

    return sendEmail({
      from,
      to,
      subject,
      html,
    });
  },
};

export default MailService;
