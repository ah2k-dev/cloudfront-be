const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const webDetails = new Schema({
  logo: {
    type: String,
  },
  socialLinks: {
    type: [String],
  },
  termsAndConditions: {
    type: String,
  },
  privacyPolicy: {
    type: String,
  },
});

const WebDetails = mongoose.model("webDetails", webDetails);

module.exports = WebDetails;
