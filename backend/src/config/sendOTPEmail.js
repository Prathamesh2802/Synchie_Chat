import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

let transporter;

async function connectEmail() {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_SERVICE,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  await transporter.verify();

  console.log("Email Service Connected");
}

async function sendMailOTP(emailid, otp, text) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM_EMAIL,
    to: emailid,
    subject: "Synchie Chat - OTP Verification",
    text: `${text} ${otp}. Valid for 5 minutes`,
  });
}

export { sendMailOTP, connectEmail };

// async function sendMailOTP(emailid, otp) {
//   const emailconstruction = nodemailer.createTransport({
//     host: process.env.SMTP_SERVICE,
//     port: process.env.SMTP_PORT,
//     auth: {
//       user: process.env.SMTP_EMAIL,
//       pass: process.env.SMTP_PASSWORD,
//     },
//   });
//   await emailconstruction.sendMail({
//     from: process.env.SMTP_FROM_EMAIL,
//     to: emailid,
//     subject: "Synchie Chat - OTP Verification",
//     text: "OTP for Registration is " + otp + " . Valid for 5 minutes",
//   });
// }

// export default sendMailOTP;
