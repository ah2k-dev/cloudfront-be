const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const projectSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  shortDesc: {
    type: String,
    required: true,
  },
  detailedDesc: {
    type: String,
    required: true,
  },
  fundingGoal: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  projectCategory: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  videoUrl: String,
  rewards: [
    {
      minCotribution: {
        type: String,
        required: true,
      },
      desc: {
        type: String,
        required: true,
      },
      deliveryDate: {
        type: Date,
        required: true,
      },
    },
  ],
  creatorBio: {
    type: String,
    required: true,
  },
  socialMediaLinks: {
    type: [String],
  },
  additionalImageUrls: {
    type: [String],
  },
  termsAndConditions: {
    type: String,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "closed", "rejected"],
    default: "pending",
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  investment: {
    type: [Schema.Types.ObjectId],
    ref: "investment",
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const Project = mongoose.model("project", projectSchema);
module.exports = Project;
