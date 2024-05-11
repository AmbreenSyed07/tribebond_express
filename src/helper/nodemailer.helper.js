/** @format */

const smtpConfig = require("../config/smtp.config");
const nodemailer = require("nodemailer");

const BCC = "ambreen.bano@synques.in";
const REPLY_TO = "Graces Resorts <ambreen.bano@synques.in>";
const FROM = "Graces Resorts <noreply@synques.in>";

// SMTP configuration

const smtpConfigOptions = {
  host: smtpConfig.host, // Replace with the SES SMTP endpoint for your region
  port: smtpConfig.port,
  secure: false, // TLS required tls
  auth: {
    user: smtpConfig.auth.user, // Your SMTP username
    pass: smtpConfig.auth.pass, // Your SMTP password
  },
};

// Create a Nodemailer transporter for SES
const transporter = nodemailer.createTransport(smtpConfigOptions);

const send = async (mailOptions) => {
  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    throw error;
  }
};

const sendEmail = async (
  to = "",
  subject = "",
  body = "",
  attachments = [],
  cc = ""
) => {
  try {
    const mailOptions = {
      from: FROM, // From email address
      to, //to,//to, // To email address"ritik.pawar@synques.in"
      subject, // Email subject
      text: "", // Plain text message
      html: `<html><body>${body}</html></body>`, // HTML message
      cc: cc, // Multiple `,` Cc (carbon copy) email addresses
      bcc: BCC, // Multiple Bcc (blind carbon copy) email addresses
      attachments,
      replyTo: REPLY_TO, // Reply-to email address
    };
    await send(mailOptions);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  sendEmail,
};
