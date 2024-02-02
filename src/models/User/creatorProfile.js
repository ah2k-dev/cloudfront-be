const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const creatorProfileSchema = new Schema({
  creator: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  investors: {
    type: [Schema.Types.ObjectId],
    ref: "user",
  },
  bandName: {
    type: String,
    required: true,
  },
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
  musicGenres: {
    type: [String],
    required: true,
  },
  socialMediaLinks: {
    type: [String],
    // required: true
  },
  website: {
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
  iban: {
    type: String,
    default: null,
  },
  instaData: {
    type: String,
  },
  spotifyData: {
    type: String,
  },
  // instagramUsername: {
  //   type: String,
  // },
  bio: {
    type: String,
    required: true,
  },
  hearAboutBacked: {
    type: String,
    required: true,
  },
  // cardName: {
  //   type: String,
  //   default: null,
  // },
  // cardNumber: {
  //   type: String,
  //   default: null,
  // },
  // bankName: {
  //   type: String,
  //   default: null,
  // },
  // expMonth: {
  //   type: String,
  //   default: null,
  // },
  // cvc: {
  //   type: String,
  //   default: null,
  // },
  occupation: {
    type: String,
    default: null,
  },
});

const creatorProfile = mongoose.model("creatorProfile", creatorProfileSchema);

module.exports = creatorProfile;
