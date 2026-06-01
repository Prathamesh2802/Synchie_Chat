//Old Import
// import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
// New Import
import SibApiV3Sdk from "sib-api-v3-sdk";

// New Config - API

let apiInstance;

function connectEmail() {
  const client = SibApiV3Sdk.ApiClient.instance;

  // API key from Brevo dashboard
  client.authentications["api-key"].apiKey = process.env.SMTP_ID;

  apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  console.log("Email Connected");
}

async function sendMailOTP(emailid, otp, text) {
  const email = {
    sender: {
      email: process.env.API_EMAIL, // you can reuse same env var name if you want
      name: process.env.API_EMAIL_NAME,
    },
    to: [
      {
        email: emailid,
      },
    ],
    subject: "Synchie Chat - OTP Verification",
    textContent: `${text} ${otp}. Valid for 5 minutes`,
  };

  try {
    const response = await apiInstance.sendTransacEmail(email);
    console.log("Email sent:", response);
  } catch (err) {
    console.error("Email error:", err);
    throw err;
  }
}

export { sendMailOTP, connectEmail };

// Old Config SMTP

//let transporter;
// async function connectEmail() {
//   transporter = nodemailer.createTransport({
//     host: process.env.SMTP_SERVICE,
//     port: process.env.SMTP_PORT,
//     auth: {
//       user: process.env.SMTP_EMAIL,
//       pass: process.env.SMTP_PASSWORD,
//     },
//   });

//   console.log("Connecting Email");
//   await transporter.verify();

//   console.log("Email Service Connected");
// }

// async function sendMailOTP(emailid, otp, text) {
//   await transporter.sendMail({
//     from: process.env.SMTP_FROM_EMAIL,
//     to: emailid,
//     subject: "Synchie Chat - OTP Verification",
//     text: `${text} ${otp}. Valid for 5 minutes`,
//   });
// }

// export { sendMailOTP, connectEmail };
