const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const investorProfileSchema = new Schema({
  investor: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },

  //   bandName: {
  //     type: String,
  //     required: true,
  //   },
  country: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  // streetAddress: {
  //   type: String,
  //   required: true,
  // },
  postalCode: {
    type: Number,
    required: true,
  },
  phoneNumber: {
    type: Number,
    required: true,
  },
  dob: {
    type: String,
    required: true,
  },
  preferredLanguage: {
    type: String,
    required: true,
  },
  nationality: {
    type: String,
    required: true,
  },
  occupation: {
    type: String,
    // required: true,
  },
  // investmentExperience: {
  //   type: String,
  //   required: true,
  // },
  musicGenres: {
    type: [String],
    // required: true,
  },
  reference: {
    type: String,
  },
  termsAndConditions: {
    type: String,
    required: true,
  },
  privacyPolicy: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    required: true,
  },
  hearAboutBacked: {
    type: String,
    required: true,
  },
});

const investorProfile = mongoose.model(
  "investorProfile",
  investorProfileSchema
);

module.exports = investorProfile;
