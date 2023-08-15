const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const webDetails = new Schema({
  logo: {
    type: String,
  },
  icon: {
    type: String,
  },
  webName: {
    type: String,
  },
  facebook: {
    type: String,
  },
  twitter: {
    type: String,
  },
  instagram: {
    type: String,
  },
  description: {
    type: String,
  },
  // socialLinks: {
  //   type: [String],
  // },
  termsAndConditions: {
    type: String,
  },
  privacyPolicy: {
    type: String,
  },
  pagesData: {
    type: Object,
  },
});

const WebDetails = mongoose.model("webDetails", webDetails);

module.exports = WebDetails;
