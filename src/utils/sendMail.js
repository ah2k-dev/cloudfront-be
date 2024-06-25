const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config({ path: "./src/config/config.env" });
const sendGrid = require("@sendgrid/mail");
sendGrid.setApiKey(process.env.SENDGRID_API_KEY);

const sendMail = async (email, subject, text) => {
  try {
    const msg = {
      from: "ah2k.dev@gmail.com",
      to: email,
      subject: subject,
      html: text,
    };

    await sendGrid.send(msg);
  } catch (error) {
    console.log("Error in sendMail", error.response.body.errors);
  }
};

module.exports = sendMail;
