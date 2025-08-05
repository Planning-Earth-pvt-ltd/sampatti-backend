import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const sendOTPNotification = async (
  recipients: string | string[],
  otp: string
) => {
  const toEmails = Array.isArray(recipients)
    ? recipients.filter(isValidEmail).join(', ')
    : isValidEmail(recipients)
    ? recipients
    : null;

  if (!toEmails) {
    throw new Error('No valid email(s) provided');
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 10px;">
      <h2>Password Reset OTP</h2>
      <p>Use the following OTP to reset your password:</p>
      <h3 style="color: #333; font-size: 24px;">${otp}</h3>
      <p>This OTP is valid for the next 10 minutes.</p>
      <p>If you didn’t request this, you can ignore this email.</p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: toEmails,
    subject: 'Your OTP Code - Admin Panel',
    html: htmlContent,
  });
};