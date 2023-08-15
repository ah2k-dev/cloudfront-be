const SuccessHandler = require("../utils/SuccessHandler");
const ErrorHandler = require("../utils/ErrorHandler");
const ContactUs = require("../models/Website/contactUs");

const contactUs = async (req, res) => {
  // #swagger.tags = ['contact']
  try {
    const { name, email, message, phone, subject } = req.body;

    const contact = await ContactUs.create({
      name,
      email,
      message,
      phone,
      subject,
    });

    return SuccessHandler("Message sent successfully", 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const getContactUs = async (req, res) => {
  // #swagger.tags = ['contact']
  try {
    const contact = await ContactUs.find({});

    return SuccessHandler("Contact us fetched successfully", 200, res, contact);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

module.exports = {
    contactUs,
    getContactUs
};