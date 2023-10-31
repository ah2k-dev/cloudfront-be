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
    type: String,
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
  rewards: [
    {
      minContribution: {
        type: String,
        required: true,
      },
      desc: {
        type: String,
        required: true,
      },
      deliveryDate: {
        type: String,
        required: true,
      },
    },
  ],
  additionalImageUrls: {
    type: [String],
  },
  termsAndConditions: {
    type: Boolean,
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
  equity: {
    // in percentage
    type: Number,
    required: true,
  },
  availableEquity: {
    // in percentage
    type: Number,
    required: true,
  },
  slug: {
    type: String,
    // required: true,
  },
  payoutRequested: {
    type: Boolean,
    default: false,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  linkToPreviousCampaign: {
    type: String,
  },
});

const Project = mongoose.model("project", projectSchema);
module.exports = Project;
