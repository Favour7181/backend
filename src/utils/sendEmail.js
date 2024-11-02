// utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendVerificationEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify Your Email',
    text: `Click the link to verify your email: ${process.env.BASE_URL}/api/users/verify-email/${token}`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendVerificationEmail;
