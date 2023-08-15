const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const contactUsSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    // required: true,
  },
  message: {
    type: String,
    // required: true,
  },
  phone: {
    type: String,
    // required: true,
  },
  subject: {
    type: String,
    // required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const ContactUs = mongoose.model("ContactUs", contactUsSchema);
module.exports = ContactUs;
