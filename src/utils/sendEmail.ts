import transporter from '@/config/nodemailer';

type MailContent = {
  from: string;
  to: string;
  subject: string;
  html: string;
};

export function sendEmail(content: MailContent): Promise<{ success: boolean }> {
  return new Promise((resolve, reject) => {
    transporter.sendMail(content, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return reject(error);
      }

      resolve({ success: true });
    });
  });
}
